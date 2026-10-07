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

function pintarConfiguracion(estado) {
    document.getElementById("vista-configuracion").hidden = estado.vista !== "configuracion";

    document.getElementById("configuracion-resumen").textContent =
        formatearCantidad(estado.imagenes.length, "imagen", "imágenes")
        + " · " + formatearPeso(sumarPesoOriginal(estado.imagenes));

    const rechazadas = contarRechazadas(estado.imagenes);
    const aviso = document.getElementById("configuracion-aviso");
    aviso.hidden = rechazadas === 0;
    aviso.textContent = formatearCantidad(rechazadas, "imagen no se puede convertir", "imágenes no se pueden convertir");
}
