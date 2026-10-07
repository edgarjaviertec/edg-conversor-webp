## Proyecto

**Conversor WebP**: webapp para convertir imágenes PNG, JPG y WebP a WebP **por lote**, ejecutada por
completo en el navegador: sin servidor, las imágenes nunca salen del equipo
del usuario. Público hispanohablante: **todo el texto visible en español**
(solo quedan como están WebP, PNG, JPG, ZIP, MP, KB).

Se publica en **Netlify** como sitio estático, con el nombre de sitio
`edg-conversor-webp` (`edg-conversor-webp.netlify.app`). El nombre visible
de la app es solo "Conversor WebP". Sin rutas ni redirecciones: no hay
`_redirects`. Netlify ya sirve los `.wasm` como `application/wasm`.

## Filosofía

- **KISS extremo.** El código debe poder leerlo y mantenerlo una sola persona.
- **KISS está por encima de DRY.** Solo se extrae código repetido si la
  función resultante tiene un nombre claro y el resultado se lee mejor. Si
  para reutilizar hay que agregar parámetros o condiciones, mejor dejarlo
  repetido.
- **La legibilidad está por encima de la abstracción.** Ante la duda, la
  opción más obvia.
- Nada de trucos: sin ternarios anidados, sin one-liners ingeniosos, sin
  metaprogramación.

## Idioma y nombres

- Todo el código en **español estricto**: archivos, carpetas, funciones,
  variables, constantes, clases CSS, ids HTML, mensajes entre workers y
  claves de `localStorage`.
- **Sin tildes ni ñ** en código y nombres de archivo (`tamano`, `conversion`,
  `imagenes`). El texto visible para el usuario y los comentarios sí las
  llevan.
- **Nunca variables de una letra**, tampoco en bucles. Nada de abreviaturas
  inventadas. Abreviaturas permitidas: `id`, `url`, `zip`, `px`, `ms`, `kb`,
  `mb`, `mp`.
- Excepciones inevitables: palabras del lenguaje, APIs del navegador
  (`Worker`, `importScripts`, `createImageBitmap`), APIs de librerías y los
  nombres de opciones de libwebp, y archivos
  de nombre fijo (`index.html`, `README.md`, `CLAUDE.md`,
  `.gitignore`).

| Elemento | Formato | Ejemplo |
|---|---|---|
| Archivos y carpetas | kebab-case | `cola-conversion.js` |
| Funciones | camelCase, verbo en infinitivo | `pintarListaResultados()` |
| Variables | camelCase, sustantivo | `imagenesDelLote` |
| Booleanos | prefijo `es`, `esta`, `tiene` | `esSinPerdida` |
| Constantes | MAYUSCULAS_CON_GUION_BAJO | `LIMITE_LADO_PX` |
| Clases CSS e ids | kebab-case | `zona-carga`, `barra-inferior` |
| Valores de texto internos | kebab-case | `"en-cola"`, `"demasiado-grande"` |

Glosario (usar siempre la misma palabra): `imagen`, `lote`, `conversion`,
`opciones`, `resultado`, `trabajador` (Web Worker), `cola`, `zona-carga`,
`configuracion`, `resultados`, `rechazada`, `ahorro`, `ayuda`,
`barra-inferior`.

## Estilo de código

- Punto y coma siempre, comillas dobles, indentación de 4 espacios (JS, CSS y
  HTML).
- Sin JSDoc. Solo un comentario `//` breve encima de lo que lo necesite,
  explicando **el porqué**, no el qué.
- Sin números mágicos: constantes con nombre.
- Salir temprano (`if (...) return;`) en vez de anidar condiciones.
- Bucles `for...of` legibles antes que cadenas de `reduce/map/filter`.
- **Emojis:** solo como iconos de interfaz en la v1, todos definidos en la
  constante `ICONOS` de `configuracion.js` (en la v2 se cambian por SVG
  tocando solo ese lugar). Se muestran envueltos en
  `<span aria-hidden="true">` junto a un texto. Nunca emojis en código fuera
  de `ICONOS`, comentarios, pruebas ni commits.

## JavaScript

- Sin frameworks, sin build, sin npm, sin `package.json`.
- **Scripts clásicos**, sin `import`/`export`. Se cargan con `<script>` al
  final del `<body>` en orden de dependencia; `aplicacion.js` siempre al
  final. Los workers también son clásicos (sin `type: "module"`) y cargan
  sus librerías con `importScripts()`.
- Todo es global: los nombres deben ser únicos y descriptivos.
- Funciones y objetos planos en vez de clases. Sin clases de error propias:
  `throw new Error("mensaje")`.
- El estado de la app vive en un solo objeto dentro de `aplicacion.js`. Los
  eventos cambian el estado y llaman a la función `pintar...()` de la sección
  afectada; nunca tocan el DOM de otra sección directamente.
- Las listas se repintan completas con `replaceChildren()` y `<template>`.
- Navegadores: Safari iOS 16+ y las dos últimas versiones de Chrome, Edge,
  Firefox y Safari Mac. Sin polyfills. Lo más nuevo (View Transitions) se usa
  solo si existe: `if (document.startViewTransition)`. No se usa la Popover
  API ni `OffscreenCanvas` (no existen en iOS 16.0–16.3).
- Fechas: construir con `getFullYear()`, `getMonth()`, `getDate()`,
  `getHours()` y `getMinutes()`. **Nunca `toISOString()`**, que da la hora
  en UTC.
- `localStorage` solo para recordar las últimas opciones, siempre dentro de
  `try/catch`; la app debe funcionar igual si falla.
- Requiere servirse por HTTP (el `.wasm` se carga con `fetch`); no funciona
  abriendo `index.html` con `file://`.

## Conversión

- Códec: **jSquash** (libwebp compilado a WASM, el mismo de Squoosh). No se
  usa `canvas.toBlob("image/webp")`: no permite las opciones y Safari no lo
  soporta.
- La conversión corre en **Web Workers** para no bloquear la interfaz. Un
  pool fijo de trabajadores toma imágenes de una cola, una a la vez cada uno.
  Los buffers se transfieren (`postMessage(datos, [buffer])`), no se copian.
- El `.wasm` se carga a mano (`WebAssembly.compileStreaming` + `init()`), así
  el bundle IIFE no depende de `import.meta.url`. Sin la versión multihilo
  del WASM (exigiría cabeceras COOP/COEP).
- **Decodificación:** todas las imágenes en el hilo principal con
  `createImageBitmap` y canvas (respeta la orientación EXIF y conserva el
  canal alfa); el trabajador recibe el buffer RGBA y solo codifica.
- **Limitaciones aceptadas:** el WebP no conserva los metadatos EXIF (fecha,
  cámara, GPS; también protege la privacidad) y los colores pasan a sRGB
  (las fotos en Display-P3 pierden algo de saturación). No se intenta
  copiarlos ni convertir perfiles de color.
- **Opciones:** solo dos, para quien quiere optimizar rápido. Todo lo demás
  queda con los valores por defecto de libwebp. Los campos internos en
  español se traducen a libwebp en **una sola función** del trabajador:

| Interfaz | Campo interno | libwebp |
|---|---|---|
| Sin pérdida | `esSinPerdida` (por defecto `false`) | `lossless` |
| Calidad | `calidad` (0–100, por defecto 75) | `quality`, oculta con sin pérdida |

- **Esfuerzo fijo**, no se muestra: `method` 4 con pérdida y el nivel 6 de
  Squoosh sin pérdida (`method` 4, `quality` 75; en sin pérdida `quality` es
  esfuerzo de compresión, no calidad). Más esfuerzo apenas reduce el peso y
  multiplica el tiempo. Si se pide en el futuro, sería un solo check
  "Compresión máxima (más lento)", no un slider.
- **Descartadas por KISS** (efecto sutil o confuso): Esfuerzo, Pérdida ligera
  (`near_lossless`), Colores planos (`image_hint`) y Conservar transparencia
  (`exact`, que solo afecta el color de píxeles invisibles; la transparencia
  del PNG se conserva siempre).

### Límites (en `configuracion.js`)

Se limita por **píxeles, no por peso del archivo**. Las dimensiones se leen
con `new Image()` antes de decodificar. Una imagen que no cumple se marca
como rechazada con su motivo; el resto del lote sigue.

| Constante | Valor | Motivo |
|---|---|---|
| `LIMITE_LADO_PX` | `16383` | Máximo del formato WebP por lado |
| `LIMITE_PIXELES_MOVIL` | `16777216` | Área máxima de canvas en iOS Safari (4096 × 4096) |
| `LIMITE_PIXELES_ESCRITORIO` | `40000000` | Valor inicial, ajustar probando |
| `TRABAJADORES_MOVIL` | `1` | Un solo pico de memoria a la vez en iOS |
| `TRABAJADORES_ESCRITORIO` | `3` | `min(navigator.hardwareConcurrency - 1, 3)` |

Móvil se detecta con `matchMedia("(pointer: coarse)")` (el iPad se anuncia
como Mac en el user agent).

## Interfaz

Tres vistas; el estado guarda cuál se muestra:
`"carga"` → `"configuracion"` → `"resultados"`.

- **Carga:** un solo `<label class="zona-carga">` con el
  `<input type="file" accept="image/png,image/jpeg,image/webp" multiple>` oculto
  visualmente. Al hacer clic en cualquier parte se abre el selector. Dentro:
  icono, texto "Arrastra tus imágenes aquí o" (solo escritorio), un `<span>`
  con estilo de botón "Elegir imágenes" (nunca `<button>` dentro del label) y
  el límite de MP según el dispositivo. Borde punteado, fondo de color sólido
  sin imagen. `accept` sin `image/*` para que iOS convierta HEIC a JPG.
  Los WebP se aceptan para recomprimir; los WebP animados se rechazan
  (canvas solo tomaría el primer cuadro), detectándolo por el bit de
  animación del bloque `VP8X` en la cabecera.
  Soltar fuera de la zona no debe abrir el archivo en el navegador.
- **Mensaje de privacidad** debajo de la zona de carga (fuera del label), con
  el icono `ICONOS.privacidad`: "Tus imágenes se procesan en tu propio
  dispositivo. No se envían a ningún lado." Para que sea cierto, la app no
  hace peticiones a terceros: sin analíticas, sin CDN, todas las librerías
  servidas desde `js/externos/`.
- **El lote queda fijo** desde que se eligen las imágenes: no existe "Agregar
  más". Para cambiar la selección se usa "Volver" (en configuración) o
  "Convertir otras imágenes" (en resultados).
- **Configuración:** resumen (cantidad, peso total, rechazadas por límite),
  panel de opciones con los últimos valores usados, "Volver"
  (descarta los archivos) y "Convertir".
- **Resultados:** aparece en cuanto se presiona Convertir. Lista en el orden
  de carga con estado por fila (en cola, convirtiendo, lista, rechazada con
  motivo), peso original, porcentaje y peso final; aumento de peso en otro
  color. Descarga individual al terminar cada fila. Durante la conversión:
  progreso y "Cancelar" (`terminate()` de los trabajadores). Al cancelar,
  las ya convertidas siguen disponibles (individual y en el ZIP) y las
  pendientes quedan como "Cancelada". Al terminar o cancelar: ahorro total,
  descarga, "Cambiar opciones" (vuelve a configuración con los mismos
  archivos) y "Convertir otras imágenes" (vuelve a carga y descarta todo).
- **Escritorio:** "Descargar todas (ZIP)" arriba en el resumen y abajo en la
  `barra-inferior` fija. **Móvil:** la acción principal de cada vista
  (Convertir, Cancelar, Descargar) en la `barra-inferior` fija y filas de dos
  líneas.
- **Descarga:** si hay una sola imagen convertida, el botón dice
  "Descargar imagen" y baja el `.webp` directo; con dos o más, "Descargar
  todas (ZIP)". ZIP con `fflate`, solo con las convertidas, llamado
  `imagenes-webp-AAAA-MM-DD-HH-MMam.zip` (hora de 12 horas con dos dígitos y
  `am`/`pm`, al momento de descargar; ej.
  `imagenes-webp-2026-10-07-12-45pm.zip`). Nombres repetidos con sufijo:
  `foto.webp`, `foto-2.webp`. `URL.revokeObjectURL()` al convertir otras imágenes.
- Sin miniaturas ni vista previa en la v1 (cada `<img>` decodifica la imagen
  completa y en iOS puede recargar la pestaña).
- **Ayuda de opciones:** etiquetas cortas y un botón `(i)` (fuera del
  `<label>`) que alterna `hidden` en la explicación y `aria-expanded` en el
  botón. Funciona con clic y toque (sin hover ni `title`), una abierta a la
  vez, se cierra con clic fuera o Escape.

## CSS

- Estilos propios, **sin framework CSS**. Fuente del sistema (`system-ui`,
  `ui-monospace`), Flexbox, modo oscuro con `prefers-color-scheme`,
  mobile-first con un solo `@media (min-width: 768px)` para escritorio.
- **ITCSS, sin BEM**, en un solo archivo `css/estilos.css` con seis secciones
  en este orden, cada una con su título en comentario: CONFIGURACION,
  GENERICOS, ELEMENTOS, OBJETOS, COMPONENTES, UTILIDADES.
- Colores y medidas solo como variables en CONFIGURACION.
- Clases sin prefijo de capa y con nombres descriptivos: `.barra-inferior`,
  `.barra-inferior-boton`.
- Estados como clase aparte con `esta-` o `tiene-`:
  `.zona-carga.esta-arrastrando`. Si existe un atributo nativo (`hidden`,
  `aria-expanded`, `disabled`), se usa ese.
- **Los ids son solo para JS**; el CSS solo usa clases.
- Sin anidamiento CSS, selectores de máximo dos niveles, `!important` solo en
  UTILIDADES.

### Tema visual

Sobrio, como una ventana nativa de macOS o Windows 11: grises neutros,
superficies blancas o gris oscuro, bordes finos, radio de 8px, sombras
mínimas y un azul de acento. Claro u oscuro según el sistema operativo.

- `:root { color-scheme: light dark; }` para que checkbox, slider, barras
  de desplazamiento y selector de archivos usen el estilo nativo del tema.
- `accent-color: var(--color-acento)` para checkbox y slider nativos.
- No se usa la palabra clave CSS `AccentColor` (Chrome no la soporta).
- Paleta inicial (verificar contraste AA al implementar):

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-fondo` | `#f3f3f3` | `#202020` | Fondo de la ventana |
| `--color-superficie` | `#ffffff` | `#2b2b2b` | Paneles, lista, zona de carga |
| `--color-borde` | `#e0e0e0` | `#3a3a3a` | Bordes y separadores |
| `--color-texto` | `#1d1d1f` | `#f5f5f7` | Texto principal |
| `--color-texto-secundario` | `#6e6e73` | `#a1a1a6` | Detalles, ayudas, tamaños |
| `--color-acento` | `#0067c0` | `#0a84ff` | Botón principal, enlaces, foco |
| `--color-texto-sobre-acento` | `#ffffff` | `#ffffff` | Texto del botón principal |
| `--color-ahorro` | `#0f7b0f` | `#6ccb5f` | Porcentaje de ahorro |
| `--color-aumento` | `#c42b1c` | `#ff99a4` | Peso que aumenta, rechazadas |

### Sin parpadeos

- Tema claro/oscuro solo con variables CSS y `prefers-color-scheme`.
- Fuentes del sistema (no hay fuentes web).
- Transiciones entre vistas con `document.startViewTransition()` cuando
  exista.

## Librerías externas

Viven en `js/externos/`, empaquetadas como scripts clásicos con un global
(`@jsquash/webp` con su `.wasm`, y `fflate`). **No se
editan a mano.** Se generaron una sola vez con npm y esbuild (`--format=iife`)
**fuera del repo** (el proyecto sigue sin npm). Cada archivo lleva en su
cabecera las versiones y la licencia; los avisos de licencia deben
conservarse.

## Git

- **Los commits los hace el dueño del proyecto.** Claude nunca ejecuta
  `git commit` ni `git push`; al terminar un cambio, solo propone el mensaje
  de commit.
- Arriba del mensaje de commit se muestran los comandos `git add` con los
  archivos que cambiaron. Ej.: `git add archivo1.js archivo2.js`.
- Mensajes de commit en español, sin emojis.
