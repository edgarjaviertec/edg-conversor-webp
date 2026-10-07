const estado = {
    vista: "carga",
    estaArrastrando: false,
    opciones: leerOpcionesGuardadas(),
    ayudaAbierta: "",
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

function cambiarOpciones(cambios) {
    Object.assign(estado.opciones, cambios);
    guardarOpciones(estado.opciones);
    pintarConfiguracion(estado);
}

function cambiarAyudaAbierta(idAyuda) {
    if (estado.ayudaAbierta === idAyuda) return;

    estado.ayudaAbierta = idAyuda;
    pintarConfiguracion(estado);
}

function esClicEnAyuda(objetivo) {
    for (const ayuda of AYUDAS) {
        if (document.getElementById(ayuda.idAyuda).contains(objetivo)) return true;
        if (document.getElementById(ayuda.idBoton).contains(objetivo)) return true;
    }
    return false;
}

function registrarEventosAyuda() {
    for (const ayuda of AYUDAS) {
        document.getElementById(ayuda.idBoton).addEventListener("click", function () {
            if (estado.ayudaAbierta === ayuda.idAyuda) {
                cambiarAyudaAbierta("");
                return;
            }
            cambiarAyudaAbierta(ayuda.idAyuda);
        });
    }

    // Un clic fuera de la ayuda y de su botón la cierra
    document.addEventListener("click", function (evento) {
        if (esClicEnAyuda(evento.target)) return;
        cambiarAyudaAbierta("");
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key !== "Escape") return;
        cambiarAyudaAbierta("");
    });
}

function registrarEventosConfiguracion() {
    document.getElementById("opcion-sin-perdida").addEventListener("change", function (evento) {
        cambiarOpciones({ esSinPerdida: evento.target.checked });
    });

    document.getElementById("opcion-calidad-control").addEventListener("input", function (evento) {
        cambiarOpciones({ calidad: Number(evento.target.value) });
    });

    document.getElementById("boton-volver").addEventListener("click", function () {
        estado.imagenes = [];
        estado.ayudaAbierta = "";
        mostrarVista("carga");
    });

    registrarEventosAyuda();
}

registrarEventosCarga();
registrarEventosConfiguracion();
pintarTodo();
