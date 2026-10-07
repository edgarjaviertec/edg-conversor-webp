const CLAVE_OPCIONES = "conversor-webp-opciones";
const CALIDAD_MINIMA = 0;
const CALIDAD_MAXIMA = 100;

function crearOpcionesPorDefecto() {
    return { esSinPerdida: false, calidad: CALIDAD_POR_DEFECTO };
}

function esCalidadValida(calidad) {
    return Number.isInteger(calidad) && calidad >= CALIDAD_MINIMA && calidad <= CALIDAD_MAXIMA;
}

// localStorage puede fallar (modo privado, almacenamiento bloqueado) o traer
// datos viejos: en cualquier caso se usan las opciones por defecto
function leerOpcionesGuardadas() {
    const opciones = crearOpcionesPorDefecto();

    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_OPCIONES));
        if (!guardadas) return opciones;

        if (typeof guardadas.esSinPerdida === "boolean") {
            opciones.esSinPerdida = guardadas.esSinPerdida;
        }
        if (esCalidadValida(guardadas.calidad)) {
            opciones.calidad = guardadas.calidad;
        }
    } catch (error) {
        return crearOpcionesPorDefecto();
    }

    return opciones;
}

function guardarOpciones(opciones) {
    try {
        localStorage.setItem(CLAVE_OPCIONES, JSON.stringify(opciones));
    } catch (error) {
        // Sin almacenamiento la app funciona igual; solo no recuerda las opciones
    }
}
