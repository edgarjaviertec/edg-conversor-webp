// Cabecera WebP: "RIFF", tamaño, "WEBP", tipo de bloque (bytes 12 a 15) y,
// si el bloque es "VP8X", un byte de banderas (byte 20) que marca la animación
const BYTES_CABECERA_WEBP = 21;
const INICIO_TIPO_BLOQUE_WEBP = 12;
const FIN_TIPO_BLOQUE_WEBP = 16;
const POSICION_BANDERAS_VP8X = 20;
const BANDERA_ANIMACION_VP8X = 2;

async function esWebpAnimado(archivo) {
    if (archivo.type !== "image/webp") return false;

    const cabecera = new Uint8Array(await archivo.slice(0, BYTES_CABECERA_WEBP).arrayBuffer());
    const bytesTipoBloque = cabecera.subarray(INICIO_TIPO_BLOQUE_WEBP, FIN_TIPO_BLOQUE_WEBP);
    const tipoBloque = new TextDecoder().decode(bytesTipoBloque);
    if (tipoBloque !== "VP8X") return false;

    return (cabecera[POSICION_BANDERAS_VP8X] & BANDERA_ANIMACION_VP8X) !== 0;
}

// Con <img> el navegador lee las dimensiones sin decodificar todos los píxeles
function leerDimensiones(archivo) {
    return new Promise(function (resolver, rechazar) {
        const url = URL.createObjectURL(archivo);
        const imagen = new Image();

        imagen.addEventListener("load", function () {
            URL.revokeObjectURL(url);
            resolver({ ancho: imagen.naturalWidth, alto: imagen.naturalHeight });
        });
        imagen.addEventListener("error", function () {
            URL.revokeObjectURL(url);
            rechazar(new Error("No se pudo leer la imagen"));
        });

        imagen.src = url;
    });
}

function rechazarImagen(imagen, motivo) {
    imagen.estadoConversion = "rechazada";
    imagen.motivo = motivo;
    return imagen;
}

async function leerImagen(id, archivo) {
    const imagen = {
        id: id,
        archivo: archivo,
        ancho: 0,
        alto: 0,
        estadoConversion: "en-cola",
        motivo: "",
        webp: null,
        urlWebp: ""
    };

    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
        return rechazarImagen(imagen, "Formato no compatible");
    }

    if (await esWebpAnimado(archivo)) {
        return rechazarImagen(imagen, "Los WebP animados no son compatibles");
    }

    try {
        const dimensiones = await leerDimensiones(archivo);
        imagen.ancho = dimensiones.ancho;
        imagen.alto = dimensiones.alto;
    } catch (error) {
        return rechazarImagen(imagen, "No se pudo leer la imagen");
    }

    const textoDimensiones = formatearDimensiones(imagen.ancho, imagen.alto);

    if (imagen.ancho > LIMITE_LADO_PX || imagen.alto > LIMITE_LADO_PX) {
        return rechazarImagen(imagen, "Supera " + LIMITE_LADO_PX + " px por lado (" + textoDimensiones + ")");
    }

    if (imagen.ancho * imagen.alto > LIMITE_PIXELES) {
        return rechazarImagen(imagen, "Supera " + formatearMegapixeles(LIMITE_PIXELES) + " (" + textoDimensiones + ")");
    }

    return imagen;
}

// Una por una para no abrir muchas imágenes a la vez en memoria
async function leerImagenes(archivos) {
    const imagenes = [];
    let id = 1;

    for (const archivo of archivos) {
        imagenes.push(await leerImagen(id, archivo));
        id = id + 1;
    }

    return imagenes;
}
