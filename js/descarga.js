// Los WebP ya están comprimidos: comprimirlos otra vez en el ZIP solo gasta tiempo
const NIVEL_COMPRESION_ZIP = 0;

// Safari necesita que la URL del ZIP siga viva un momento después del clic
const ESPERA_LIBERAR_URL_MS = 10000;

function crearNombreWebp(nombreOriginal) {
    const posicionPunto = nombreOriginal.lastIndexOf(".");
    if (posicionPunto <= 0) {
        return nombreOriginal + ".webp";
    }
    return nombreOriginal.slice(0, posicionPunto) + ".webp";
}

// foto.jpg y foto.png generan el mismo foto.webp: el segundo pasa a foto-2.webp
function crearNombresUnicos(imagenes) {
    const nombresPorId = new Map();
    const nombresUsados = new Set();

    for (const imagen of imagenes) {
        const nombreBase = crearNombreWebp(imagen.archivo.name);
        let nombre = nombreBase;
        let numero = 2;

        while (nombresUsados.has(nombre)) {
            nombre = nombreBase.replace(/\.webp$/, "-" + numero + ".webp");
            numero = numero + 1;
        }

        nombresUsados.add(nombre);
        nombresPorId.set(imagen.id, nombre);
    }

    return nombresPorId;
}

// El enlace no se agrega a la página: solo se usa para que el navegador descargue
function descargarArchivo(url, nombre) {
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
}

async function descargarZip(imagenes) {
    const nombresPorId = crearNombresUnicos(imagenes);
    const archivosZip = {};

    for (const imagen of imagenes) {
        const bytes = new Uint8Array(await imagen.webp.arrayBuffer());
        archivosZip[nombresPorId.get(imagen.id)] = bytes;
    }

    const zip = fflate.zipSync(archivosZip, { level: NIVEL_COMPRESION_ZIP });
    const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" }));
    descargarArchivo(url, crearNombreZip(new Date()));

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, ESPERA_LIBERAR_URL_MS);
}
