// En la v2 se cambian por SVG tocando solo este objeto
const ICONOS = {
    zonaCarga: "🖼️",
    privacidad: "🔒",
    informacion: "ℹ️"
};

const TIPOS_ACEPTADOS = ["image/png", "image/jpeg", "image/webp"];

// Máximo del formato WebP por lado
const LIMITE_LADO_PX = 16383;

// Probado con fotos reales de 64 MP en iPhone 16e; se deja margen para equipos con menos memoria
const LIMITE_PIXELES = 50000000;

const TRABAJADORES_MOVIL = 1;
const TRABAJADORES_ESCRITORIO = 3;

const CALIDAD_POR_DEFECTO = 75;
