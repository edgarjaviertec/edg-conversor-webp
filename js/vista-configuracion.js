const AYUDAS = [
    { idAyuda: "ayuda-sin-perdida", idBoton: "ayuda-boton-sin-perdida" },
    { idAyuda: "ayuda-calidad", idBoton: "ayuda-boton-calidad" }
];

function contarRechazadas(imagenes) {
    let cantidad = 0;
    for (const imagen of imagenes) {
        if (imagen.estadoConversion === "rechazada") {
            cantidad = cantidad + 1;
        }
    }
    return cantidad;
}

function sumarPesoOriginal(imagenes) {
    let bytes = 0;
    for (const imagen of imagenes) {
        bytes = bytes + imagen.archivo.size;
    }
    return bytes;
}

function pintarResumenConfiguracion(estado) {
    document.getElementById("configuracion-resumen").textContent =
        formatearCantidad(estado.imagenes.length, "imagen", "imágenes")
        + " · " + formatearPeso(sumarPesoOriginal(estado.imagenes));

    const rechazadas = contarRechazadas(estado.imagenes);
    const aviso = document.getElementById("configuracion-aviso");
    aviso.hidden = rechazadas === 0;
    aviso.textContent = formatearCantidad(rechazadas, "imagen no se puede convertir", "imágenes no se pueden convertir");

    // Si ninguna se puede convertir, no hay nada que hacer con "Convertir"
    document.getElementById("boton-convertir").disabled = rechazadas === estado.imagenes.length;
}

function pintarOpciones(opciones) {
    document.getElementById("opcion-sin-perdida").checked = opciones.esSinPerdida;

    // En sin pérdida la calidad no se usa: libwebp siempre conserva la imagen idéntica
    document.getElementById("opcion-calidad").hidden = opciones.esSinPerdida;
    document.getElementById("opcion-calidad-control").value = opciones.calidad;
    document.getElementById("opcion-calidad-valor").textContent = opciones.calidad;
}

function pintarAyudas(ayudaAbierta) {
    document.getElementById("ayuda-icono-sin-perdida").textContent = ICONOS.informacion;
    document.getElementById("ayuda-icono-calidad").textContent = ICONOS.informacion;

    for (const ayuda of AYUDAS) {
        const estaAbierta = ayuda.idAyuda === ayudaAbierta;
        document.getElementById(ayuda.idAyuda).hidden = !estaAbierta;
        document.getElementById(ayuda.idBoton).setAttribute("aria-expanded", String(estaAbierta));
    }
}

function pintarConfiguracion(estado) {
    document.getElementById("vista-configuracion").hidden = estado.vista !== "configuracion";

    pintarResumenConfiguracion(estado);
    pintarOpciones(estado.opciones);
    pintarAyudas(estado.ayudaAbierta);
}
