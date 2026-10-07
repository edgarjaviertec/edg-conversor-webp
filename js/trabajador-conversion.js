importScripts("externos/jsquash-webp.js");

// Las rutas se resuelven desde este archivo, que vive en js/
const CARPETA_EXTERNOS = "externos/";

// Esfuerzo fijo: con más esfuerzo apenas baja el peso y el tiempo se multiplica
const METODO_CON_PERDIDA = 4;

// Nivel 6 de la tabla kLosslessPresets de libwebp, el mismo que usa Squoosh.
// En sin pérdida, quality no es calidad sino esfuerzo de compresión.
const METODO_SIN_PERDIDA = 4;
const ESFUERZO_SIN_PERDIDA = 75;

let codificadorListo = null;

function iniciarCodificador() {
    if (codificadorListo) return codificadorListo;

    // jSquash elige solo entre webp_enc.wasm y webp_enc_simd.wasm según el navegador
    codificadorListo = JsquashWebp.init({
        locateFile: function (archivo) {
            return CARPETA_EXTERNOS + archivo;
        }
    });
    return codificadorListo;
}

function traducirOpcionesALibwebp(opciones) {
    if (opciones.esSinPerdida) {
        return {
            lossless: 1,
            method: METODO_SIN_PERDIDA,
            quality: ESFUERZO_SIN_PERDIDA
        };
    }

    return {
        lossless: 0,
        method: METODO_CON_PERDIDA,
        quality: opciones.calidad
    };
}

async function convertirImagen(mensaje) {
    await iniciarCodificador();

    const pixeles = new ImageData(
        new Uint8ClampedArray(mensaje.pixeles),
        mensaje.ancho,
        mensaje.alto
    );
    const webp = await JsquashWebp.encode(pixeles, traducirOpcionesALibwebp(mensaje.opciones));

    // Se transfiere el buffer en vez de copiarlo
    self.postMessage({ id: mensaje.id, webp: webp }, [webp]);
}

self.addEventListener("message", async function (evento) {
    const mensaje = evento.data;

    try {
        await convertirImagen(mensaje);
    } catch (error) {
        self.postMessage({ id: mensaje.id, error: String(error) });
    }
});
