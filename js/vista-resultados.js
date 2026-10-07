function contarPorEstado(imagenes, estadoConversion) {
    let cantidad = 0;
    for (const imagen of imagenes) {
        if (imagen.estadoConversion === estadoConversion) {
            cantidad = cantidad + 1;
        }
    }
    return cantidad;
}

function filtrarListas(imagenes) {
    const listas = [];
    for (const imagen of imagenes) {
        if (imagen.estadoConversion === "lista") {
            listas.push(imagen);
        }
    }
    return listas;
}

function pintarProgreso(estado) {
    const pendientes = contarPorEstado(estado.imagenes, "en-cola") + contarPorEstado(estado.imagenes, "convirtiendo");
    const procesadas = estado.totalLote - pendientes;

    document.getElementById("resultados-titulo").textContent = "Convirtiendo…";
    document.getElementById("resultados-detalle").textContent =
        procesadas + " de " + formatearCantidad(estado.totalLote, "imagen", "imágenes");

    const progreso = document.getElementById("resultados-progreso");
    progreso.hidden = false;
    progreso.max = estado.totalLote;
    progreso.value = procesadas;
}

function crearDetalleTerminado(estado, bytesFinal) {
    const partes = [];

    const listas = contarPorEstado(estado.imagenes, "lista");
    if (listas > 0) {
        partes.push(formatearCantidad(listas, "convertida", "convertidas"));
    }

    const rechazadas = contarPorEstado(estado.imagenes, "rechazada");
    if (rechazadas > 0) {
        partes.push(formatearCantidad(rechazadas, "rechazada", "rechazadas"));
    }

    const canceladas = contarPorEstado(estado.imagenes, "cancelada");
    if (canceladas > 0) {
        partes.push(formatearCantidad(canceladas, "cancelada", "canceladas"));
    }

    if (listas > 0) {
        partes.push(formatearPeso(bytesFinal) + " en total");
    }
    return partes.join(" · ");
}

function pintarResumenTerminado(estado) {
    document.getElementById("resultados-progreso").hidden = true;

    const listas = filtrarListas(estado.imagenes);
    const titulo = document.getElementById("resultados-titulo");
    const detalle = document.getElementById("resultados-detalle");

    if (listas.length === 0) {
        titulo.textContent = "No se convirtió ninguna imagen";
        detalle.textContent = crearDetalleTerminado(estado, 0);
        return;
    }

    let bytesOriginal = 0;
    let bytesFinal = 0;
    for (const imagen of listas) {
        bytesOriginal = bytesOriginal + imagen.archivo.size;
        bytesFinal = bytesFinal + imagen.webp.size;
    }

    const ahorro = calcularAhorro(bytesOriginal, bytesFinal);
    if (ahorro >= 0) {
        titulo.textContent = "Ahorraste " + ahorro + "%";
    } else {
        titulo.textContent = "El peso aumentó " + Math.abs(ahorro) + "%";
    }
    detalle.textContent = crearDetalleTerminado(estado, bytesFinal);
}

function pintarFilaLista(fila, imagen) {
    const ahorro = calcularAhorro(imagen.archivo.size, imagen.webp.size);
    const cambio = fila.querySelector("[data-campo='cambio']");
    cambio.textContent = formatearCambioPeso(ahorro);
    cambio.classList.toggle("tiene-ahorro", ahorro >= 0);
    cambio.classList.toggle("tiene-aumento", ahorro < 0);

    fila.querySelector("[data-campo='texto']").textContent =
        formatearPeso(imagen.archivo.size) + " → " + formatearPeso(imagen.webp.size);

    const descarga = fila.querySelector("[data-campo='descarga']");
    const nombreWebp = crearNombreWebp(imagen.archivo.name);
    descarga.hidden = false;
    descarga.href = imagen.urlWebp;
    descarga.download = nombreWebp;
    descarga.setAttribute("aria-label", "Descargar " + nombreWebp);
}

function crearFilaResultado(imagen) {
    const plantilla = document.getElementById("plantilla-fila-resultado");
    const fila = plantilla.content.firstElementChild.cloneNode(true);
    const texto = fila.querySelector("[data-campo='texto']");

    fila.querySelector("[data-campo='nombre']").textContent = imagen.archivo.name;
    fila.querySelector("[data-campo='indicador']").hidden = imagen.estadoConversion !== "convirtiendo";
    fila.querySelector("[data-campo='descarga']").hidden = true;

    if (imagen.estadoConversion === "lista") {
        pintarFilaLista(fila, imagen);
    } else if (imagen.estadoConversion === "convirtiendo") {
        texto.textContent = "Convirtiendo…";
    } else if (imagen.estadoConversion === "en-cola") {
        texto.textContent = "En cola";
    } else if (imagen.estadoConversion === "cancelada") {
        texto.textContent = "Cancelada";
    } else {
        texto.textContent = imagen.motivo;
        texto.classList.add("esta-rechazada");
    }

    return fila;
}

function pintarListaResultados(imagenes) {
    const filas = [];
    for (const imagen of imagenes) {
        filas.push(crearFilaResultado(imagen));
    }
    document.getElementById("lista-resultados").replaceChildren(...filas);
}

function pintarAccionesResultados(estado) {
    const cantidadListas = contarPorEstado(estado.imagenes, "lista");
    const botonDescargar = document.getElementById("boton-descargar");

    document.getElementById("boton-cancelar").hidden = !estado.estaConvirtiendo;
    document.getElementById("acciones-secundarias").hidden = estado.estaConvirtiendo;
    botonDescargar.hidden = estado.estaConvirtiendo || cantidadListas === 0;

    if (cantidadListas === 1) {
        botonDescargar.textContent = "Descargar imagen";
    } else {
        botonDescargar.textContent = "Descargar todas (ZIP)";
    }
}

function pintarResultados(estado) {
    document.getElementById("vista-resultados").hidden = estado.vista !== "resultados";
    if (estado.vista !== "resultados") return;

    if (estado.estaConvirtiendo) {
        pintarProgreso(estado);
    } else {
        pintarResumenTerminado(estado);
    }
    pintarListaResultados(estado.imagenes);
    pintarAccionesResultados(estado);
}
