// Cada lote tiene un número: al cancelar se incrementa y cualquier respuesta
// tardía del lote anterior se ignora
let numeroLoteActual = 0;
let imagenesPendientes = [];
const trabajadoresActivos = new Set();

function contarTrabajadores(cantidadImagenes) {
    const esDispositivoMovil = window.matchMedia("(pointer: coarse)").matches;
    let cantidad = TRABAJADORES_ESCRITORIO;

    if (esDispositivoMovil) {
        cantidad = TRABAJADORES_MOVIL;
    } else if (navigator.hardwareConcurrency - 1 < cantidad) {
        // Dejar un núcleo libre para la interfaz
        cantidad = Math.max(1, navigator.hardwareConcurrency - 1);
    }

    return Math.min(cantidad, cantidadImagenes);
}

function crearTrabajador() {
    const trabajador = new Worker("js/trabajador-conversion.js");
    trabajadoresActivos.add(trabajador);
    return trabajador;
}

function terminarTrabajador(trabajador) {
    trabajador.terminate();
    trabajadoresActivos.delete(trabajador);
}

// El trabajador atiende una imagen a la vez, así que basta con esperar su próximo mensaje
function convertirEnTrabajador(trabajador, id, pixeles, opciones) {
    return new Promise(function (resolver) {
        function recibirMensaje(evento) {
            trabajador.removeEventListener("message", recibirMensaje);
            trabajador.removeEventListener("error", recibirError);
            resolver(evento.data);
        }

        // Si el navegador mata el trabajador (por ejemplo, sin memoria) no llega ningún mensaje
        function recibirError() {
            trabajador.removeEventListener("message", recibirMensaje);
            trabajador.removeEventListener("error", recibirError);
            resolver({ id: id, error: "El trabajador se detuvo" });
        }

        trabajador.addEventListener("message", recibirMensaje);
        trabajador.addEventListener("error", recibirError);
        trabajador.postMessage(
            { id: id, pixeles: pixeles.data.buffer, ancho: pixeles.width, alto: pixeles.height, opciones: opciones },
            [pixeles.data.buffer]
        );
    });
}

async function ejecutarTrabajador(numeroLote, opciones, avisos) {
    let trabajador = crearTrabajador();

    while (imagenesPendientes.length > 0) {
        const imagen = imagenesPendientes.shift();
        avisos.alEmpezarImagen(imagen);

        let pixeles;
        try {
            pixeles = await decodificarImagen(imagen.archivo);
        } catch (error) {
            if (numeroLote !== numeroLoteActual) return;
            avisos.alFallarImagen(imagen, "No se pudo leer la imagen");
            continue;
        }
        if (numeroLote !== numeroLoteActual) return;

        const respuesta = await convertirEnTrabajador(trabajador, imagen.id, pixeles, opciones);
        if (numeroLote !== numeroLoteActual) return;

        if (respuesta.error) {
            // El módulo WASM puede quedar inutilizable después de un error
            terminarTrabajador(trabajador);
            trabajador = crearTrabajador();
            avisos.alFallarImagen(imagen, "No se pudo convertir (posiblemente por falta de memoria)");
            continue;
        }

        avisos.alTerminarImagen(imagen, respuesta.webp);
    }

    terminarTrabajador(trabajador);
}

// avisos: { alEmpezarImagen(imagen), alTerminarImagen(imagen, webp),
//           alFallarImagen(imagen, motivo), alTerminarLote() }
async function convertirLote(imagenes, opciones, avisos) {
    numeroLoteActual = numeroLoteActual + 1;
    const numeroLote = numeroLoteActual;
    imagenesPendientes = imagenes.slice();

    const ejecuciones = [];
    const cantidadTrabajadores = contarTrabajadores(imagenes.length);
    for (let numeroTrabajador = 0; numeroTrabajador < cantidadTrabajadores; numeroTrabajador++) {
        ejecuciones.push(ejecutarTrabajador(numeroLote, opciones, avisos));
    }

    await Promise.all(ejecuciones);
    if (numeroLote !== numeroLoteActual) return;
    avisos.alTerminarLote();
}

// Los trabajadores terminados no responden: sus promesas quedan pendientes
// y el número de lote evita que se use cualquier resultado tardío
function cancelarLote() {
    numeroLoteActual = numeroLoteActual + 1;
    imagenesPendientes = [];

    for (const trabajador of trabajadoresActivos) {
        trabajador.terminate();
    }
    trabajadoresActivos.clear();
}
