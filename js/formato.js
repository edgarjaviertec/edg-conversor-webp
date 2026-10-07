const PIXELES_POR_MP = 1000000;
const BYTES_POR_KB = 1024;
const BYTES_POR_MB = 1024 * 1024;

function formatearDecimal(numero) {
    return numero.toLocaleString("es", { maximumFractionDigits: 1 });
}

function formatearMegapixeles(pixeles) {
    return formatearDecimal(pixeles / PIXELES_POR_MP) + " MP";
}

function formatearDimensiones(ancho, alto) {
    return ancho + " × " + alto + " px";
}

function formatearPeso(bytes) {
    if (bytes < BYTES_POR_MB) {
        return Math.round(bytes / BYTES_POR_KB) + " KB";
    }
    return formatearDecimal(bytes / BYTES_POR_MB) + " MB";
}

function formatearCantidad(cantidad, singular, plural) {
    if (cantidad === 1) {
        return "1 " + singular;
    }
    return cantidad + " " + plural;
}
