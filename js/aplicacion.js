const estado = {
    vista: "carga",
    estaArrastrando: false,
    opciones: { esSinPerdida: false, calidad: CALIDAD_POR_DEFECTO },
    imagenes: [],
    estaConvirtiendo: false
};

function pintarTodo() {
    pintarCarga(estado);
    pintarConfiguracion(estado);
}

function mostrarVista(vista) {
    estado.vista = vista;

    if (!document.startViewTransition) {
        pintarTodo();
        return;
    }
    document.startViewTransition(pintarTodo);
}

function cambiarArrastre(estaArrastrando) {
    if (estado.estaArrastrando === estaArrastrando) return;

    estado.estaArrastrando = estaArrastrando;
    pintarCarga(estado);
}

async function cargarArchivos(archivos) {
    if (archivos.length === 0) return;

    estado.imagenes = await leerImagenes(Array.from(archivos));
    mostrarVista("configuracion");
}

function registrarEventosCarga() {
    const zona = document.getElementById("zona-carga");
    const entrada = document.getElementById("zona-carga-entrada");

    entrada.addEventListener("change", async function () {
        await cargarArchivos(entrada.files);
        // Permite volver a elegir los mismos archivos después de "Volver"
        entrada.value = "";
    });

    zona.addEventListener("dragover", function (evento) {
        evento.preventDefault();
        cambiarArrastre(true);
    });

    zona.addEventListener("dragleave", function () {
        cambiarArrastre(false);
    });

    zona.addEventListener("drop", function (evento) {
        evento.preventDefault();
        cambiarArrastre(false);
        cargarArchivos(evento.dataTransfer.files);
    });

    // Si sueltan la imagen fuera de la zona, el navegador la abriría y saldría de la app
    window.addEventListener("dragover", function (evento) {
        evento.preventDefault();
        if (!zona.contains(evento.target)) {
            evento.dataTransfer.dropEffect = "none";
        }
    });
    window.addEventListener("drop", function (evento) {
        evento.preventDefault();
    });
}

function registrarEventosConfiguracion() {
    document.getElementById("boton-volver").addEventListener("click", function () {
        estado.imagenes = [];
        mostrarVista("carga");
    });
}

registrarEventosCarga();
registrarEventosConfiguracion();
pintarTodo();
