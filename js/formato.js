const PIXELES_POR_MP = 1000000;
const BYTES_POR_KB = 1024;
const BYTES_POR_MB = 1024 * 1024;
const PORCENTAJE_TOTAL = 100;
const HORAS_POR_MEDIODIA = 12;

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

// Positivo si el WebP pesa menos que el original ("−56%"), negativo si pesa más ("+12%")
function calcularAhorro(bytesOriginal, bytesFinal) {
    return Math.round((1 - bytesFinal / bytesOriginal) * PORCENTAJE_TOTAL);
}

function formatearCambioPeso(ahorro) {
    if (ahorro >= 0) {
        return "−" + ahorro + "%";
    }
    return "+" + Math.abs(ahorro) + "%";
}

function completarConCero(numero) {
    return String(numero).padStart(2, "0");
}

// Con getHours() y no toISOString(), que daría la hora en UTC
function crearNombreZip(fecha) {
    const horas = fecha.getHours();
    let sufijo = "am";
    if (horas >= HORAS_POR_MEDIODIA) {
        sufijo = "pm";
    }

    // En formato de 12 horas, las 0 y las 12 se escriben como 12
    let horasDoce = horas % HORAS_POR_MEDIODIA;
    if (horasDoce === 0) {
        horasDoce = HORAS_POR_MEDIODIA;
    }

    return "imagenes-webp-"
        + fecha.getFullYear() + "-"
        + completarConCero(fecha.getMonth() + 1) + "-"
        + completarConCero(fecha.getDate()) + "-"
        + completarConCero(horasDoce) + "-"
        + completarConCero(fecha.getMinutes()) + sufijo
        + ".zip";
}

function formatearCantidad(cantidad, singular, plural) {
    if (cantidad === 1) {
        return "1 " + singular;
    }
    return cantidad + " " + plural;
}
