## Proyecto
Sitio de portfolio para una artista plástica. Estático, hecho con Astro.
Data-driven: cada obra es un archivo de datos; yo (el dev) edito el código para
agregar obras. No hay CMS ni panel de administración.

## Objetivos del sitio
Mostrar el portfolio, permitir consultas/venta de obras, y captar encargos.
La venta se resuelve con un botón que abre WhatsApp con mensaje pre-cargado
(sin carrito ni checkout).

## Principios de diseño
La OBRA es la protagonista; el diseño se queda atrás. Paleta neutra (blancos/grises
cálidos) con un único acento terracota. Mucho espacio en blanco. Serif (Fraunces)
para títulos, sans (Inter) para texto. JavaScript al mínimo indispensable.

## Arquitectura y archivos clave
- src/styles/tokens.css — tokens de diseño (color, tipografía, espaciado). Editar acá para cambios de estética.
- src/styles/global.css — reset + estilos base + utilidades compartidas (`.btn`/`.btn-primary`/`.btn-outline`, `.sr-only`).
- src/config/site.ts — config global: whatsappNumber, nombre/tagline, socials, email, bio (extracto + párrafos), statement, contactForm (endpoint/accessKey para Web3Forms o Formspree, todavía sin conectar).
- src/content.config.ts — schemas de las collections "obras", "exposiciones" y "prensa".
- src/content/obras/*.yaml, src/content/exposiciones/*.yaml, src/content/prensa/*.yaml — una entrada por archivo en cada collection.
- src/layouts/Layout.astro — layout base: fuentes, Header/Footer, SEO (title/description/canonical) y meta tags Open Graph/Twitter.
- src/components/Header.astro — nav sticky con menú hamburguesa en mobile (toggle vía src/scripts/nav.js, sin dependencias).
- src/components/Footer.astro — redes, email, WhatsApp y copyright.
- src/components/ObraCard.astro — tarjeta de obra (se usa solo en /galeria, acoplada al lightbox).
- src/components/Filters.astro — filtros de galería (serie/técnica/año), client-side.
- src/components/Lightbox.astro — overlay con zoom y miniaturas, uno por obra.
- src/scripts/gallery.js — JS de filtros + lightbox (delegación de eventos, mínimo).
- src/scripts/nav.js — JS del menú hamburguesa (toggle de clase + aria-expanded).
- src/content/obras/images/, src/content/exposiciones/images/, src/content/prensa/images/ — imágenes de cada collection (vía helper `image()`, no en public/).
- src/assets/foto-artista.svg — foto de la artista para /sobre (placeholder), importada directamente con `astro:assets` (no es parte de una collection).
- src/pages/index.astro — home (hero con obra destacada, selección de destacadas, extracto de bio, accesos).
- src/pages/galeria.astro — galería completa con filtros y lightbox (antes vivía en index.astro).
- src/pages/sobre.astro, src/pages/exposiciones.astro, src/pages/encargos.astro, src/pages/contacto.astro — resto de las páginas del sitio.
- astro.config.mjs — define `site` (placeholder `https://nombreartista.com`, reemplazar por el dominio real), necesario para que canonical/Open Graph generen URLs absolutas.

## Modelo de datos (obra)
titulo, anio, tecnica, dimensiones (opcional), tipo ("fisica" | "digital",
default "fisica"), serie (opcional), estado ("disponible" | "vendida" |
"no_venta"), precio (opcional), imagenPrincipal, imagenesDetalle[],
descripcion, destacada (bool).

`dimensiones` es opcional porque las obras digitales (ilustraciones, encargos
para cortometrajes) no siempre tienen una medida física con sentido. Cuando
falta, ObraCard y Lightbox omiten esa línea por completo (no queda un
renglón vacío ni "undefined"): en ObraCard.astro es un `{dimensiones && <p>...}`,
y en gallery.js el bloque que llena `lightbox-meta-dimensiones` la oculta con
`.hidden = true` (mismo patrón que ya se usaba para `serie`). El campo `tipo`
por ahora solo se guarda en el schema — no cambia nada visible en la card ni
en el lightbox todavía.

## Modelo de datos (exposición)
titulo, lugar, ciudad, fecha (date), tipo ("individual" | "colectiva"),
descripcion, imagen (opcional). Listado en /exposiciones, orden cronológico
descendente (más reciente primero) por `fecha`.

## Modelo de datos (prensa / encargos)
titulo, tipo (string libre, ej. "Ilustración para cortometraje", "Aparición
en cine", "Colaboración", "Prensa"), anio, descripcion, imagen (opcional),
link (opcional, url externa). Listado en /encargos, orden descendente por
`anio`.

## Reglas de estado
- disponible: muestra precio + botón WhatsApp "Consultar / Comprar".
- vendida: muestra cartel "Vendida", sin precio ni botón.
- no_venta: solo la ficha, sin precio ni botón.

## Formato del número de WhatsApp
Internacional sin +, sin 0 y sin 15, con 9 de celular. Ej Argentina: 549 + área + número.

## Cómo trabajamos
Vamos por bloques y freno para revisión antes de seguir. Verificar con npm run build.
Dev server: npm run dev → http://localhost:4321.

## Estado actual
Bloque 1 completo (andamiaje, tokens, schema, 4 obras de ejemplo, listado básico).
Bloque 2 completo: galería con grilla fluida (auto-fit, sin obras "colgando"),
filtros client-side (serie/técnica/año) en src/components/Filters.astro, lightbox
con zoom y miniaturas navegables en src/components/Lightbox.astro, botón de
WhatsApp por estado (helper whatsappLinkParaObra en src/config/site.ts), JS de
interacción en src/scripts/gallery.js.

Cambio de arquitectura respecto a Bloque 1: imagenPrincipal e imagenesDetalle
ahora usan el helper `image()` de content collections (en vez de string plano),
con los archivos de imagen movidos a src/content/obras/images/ (antes en
public/images/obras/). Esto habilita la optimización de imágenes de Astro
(<Image />) que pide el lightbox. Los .yaml de obras referencian las imágenes
con rutas relativas (ej. "./images/placeholder-1.svg").

Fixes de lightbox (post-Bloque 2): se corrigieron 4 bugs en
src/components/Lightbox.astro.
- Layout roto: el grid de `.lightbox-panel` dependía de auto-placement
  implícito, que no ubicaba la ficha al lado de la imagen. Ahora usa
  `grid-template-areas` explícito ("stage info" / "thumbs info", una sola
  columna en mobile) para un layout predecible.
- Miniaturas rotas: los botones/img de miniatura se crean con
  `document.createElement` en gallery.js, y Astro solo aplica su atributo de
  scoping (`data-astro-cid-*`) al markup escrito en la plantilla `.astro` —
  por eso los selectores scoped `.lightbox-thumb` nunca matcheaban ese
  contenido inyectado por JS. Se resolvió envolviendo esas reglas en
  `:global()`. Importante para cualquier futuro elemento creado vía JS dentro
  de un componente Astro con `<style>` scoped: usar `:global()`.
- Zoom poco evidente: se agregó un ícono de lupa visible sobre la imagen y un
  hover que amplía levemente (scale 1.08) además del zoom completo al click
  (scale 2, toggle con clase `.zoomed`).
- Texto en azul: reportado pero no se pudo reproducir — se verificó con
  Playwright (computed styles) que título/meta/descripción/precio usan los
  colores de `tokens.css` correctamente. Si reaparece, probablemente sea
  caché del navegador (hacer hard refresh) y no un bug de CSS.

Verificación de este fix se hizo con Playwright (instalado ad-hoc, no es
dependencia del proyecto) para inspeccionar estilos computados y capturar
screenshots del lightbox en desktop y mobile.

Soporte para obras digitales (post-Bloque 2): se hizo `dimensiones` opcional
y se agregó `tipo` ("fisica" | "digital", default "fisica") al schema en
content.config.ts, para poder cargar ilustraciones/encargos digitales que no
tienen una medida física. Ver detalle en "Modelo de datos" arriba. Verificado
con `npm run build` usando una obra de prueba sin `dimensiones` (borrada
después de confirmar que no queda renglón vacío ni "undefined"), y con el
build normal de las 4 obras de ejemplo (que sí tienen dimensiones).

Extracción de originales (works/procesadas): se extrajeron las imágenes
embebidas de 4 PDFs (works/*.pdf, cada uno con un escaneo de foto de cuadro)
a JPG calidad 95 en works/procesadas, mismo criterio que las conversiones
previas desde HEIC (máx. 3000px lado largo, orientación EXIF corregida,
perfil ICC preservado). Se usó PyMuPDF para leer el XObject de imagen de
mayor resolución de cada PDF (cada PDF tenía una imagen grande + un logo
pequeño de 240x90 embebido) y el perfil ICC real referenciado en el
`/ColorSpace` del PDF (no el que devuelve `extract_image` por sí solo, que
no lo incluye), y luego Pillow para reescalar/reexportar. Los 4 resultaron
sRGB IEC61966-2.1 (perfil estándar, no uno custom). Resoluciones finales:
captando-el-movimiento-de-una-ciudad-dinamica.jpg 1772×1816 (sin reescalar),
luz-y-asfalto.jpg 2336×3000 (reescalada desde 3140×4032), paisaje.jpg
1540×2316 (sin reescalar), pensamientos-sumergidos.jpg 1816×1824 (sin
reescalar). Los PDFs originales no se tocaron. Todavía no se cargaron como
obras reales ni se movieron a src/content/obras/images/.

Bloque 3 completo: páginas del sitio. Sin efecto de pincelada ni animaciones
(eso queda para Bloque 4).
- Navegación: Header.astro (nav sticky, activo por ruta con `aria-current`,
  menú hamburguesa en mobile) y Footer.astro (redes, email, WhatsApp,
  copyright), ambos montados una sola vez en Layout.astro. El toggle del
  menú mobile es JS mínimo (src/scripts/nav.js, toggle de clase +
  aria-expanded) en vez de un checkbox-hack, para mantener accesibilidad
  (aria-expanded real) sin sumar dependencias.
- Reestructuración: la galería completa (filtros + lightbox) se movió de
  index.astro a src/pages/galeria.astro. index.astro pasó a ser la home
  (hero con la obra destacada de anio más reciente, selección con el resto
  de las obras `destacada: true`, extracto de bio, accesos a Galería y
  Contacto). Se agregaron src/pages/sobre.astro, exposiciones.astro,
  encargos.astro y contacto.astro.
- Nuevas collections: "exposiciones" y "prensa" en content.config.ts (ver
  "Modelo de datos" arriba), con 4 entradas de ejemplo cada una en
  src/content/exposiciones/ y src/content/prensa/ (algunas con `imagen`,
  otras sin, para probar el campo opcional). "Encargos y prensa" en el sitio
  usa la collection "prensa".
- Bio y statement: viven en site.ts (`siteConfig.bio.extracto`,
  `siteConfig.bio.parrafos`, `siteConfig.statement`), no en el HTML. La foto
  de la artista es un placeholder en src/assets/foto-artista.svg (no es una
  obra ni pertenece a una collection, así que se importa directo con
  `astro:assets` en vez de vía `image()`).
- Home: la ObraCard existente (ObraCard.astro) está acoplada al lightbox
  (role="button" + data-obra-id que espera gallery.js), así que no se
  reutiliza tal cual en la home — ahí las obras destacadas son tarjetas
  simples que linkean a /galeria en vez de abrir el lightbox, para no cargar
  gallery.js/Lightbox.astro en una página que no los necesita.
- Formulario de contacto: maquetado en contacto.astro, `action` apunta a
  `siteConfig.contactForm.endpoint` (vacío por ahora) y manda el campo oculto
  `access_key` solo si `siteConfig.contactForm.accessKey` está seteado
  (convención Web3Forms). Incluye un honeypot (`botcheck`, oculto por CSS)
  para spam básico. No tiene JS de envío — cuando se cargue el endpoint real
  el form ya queda funcional.
- SEO: Layout.astro genera `<title>`, meta description, canonical y meta
  tags Open Graph/Twitter (title/description/url/image) por página, usando
  `Astro.site` (ver astro.config.mjs) para URLs absolutas.
- Verificado con `npm run build` (6 páginas) y con Playwright (instalado
  ad-hoc en el scratchpad, no es dependencia del proyecto): screenshots
  desktop/mobile de las 6 páginas, chequeo de que el menú hamburguesa abre y
  cierra, y de que el lightbox sigue abriendo correctamente desde
  /galeria. Sin errores de consola.

Fix de layout para entradas sin imagen (post-Bloque 3): en /exposiciones y
/encargos las entradas sin `imagen` rompían el layout (texto encajonado en
la columna angosta pensada para la imagen, títulos partiéndose, grilla
desordenada). Resuelto sin tocar tokens.css ni el sistema de diseño:
- src/pages/exposiciones.astro: el `<li>` ahora agrega la clase condicional
  `expo-item--full` cuando no hay `imagen`. `.expo-item--full .expo-info`
  usa `grid-column: 1 / -1` para que el bloque de texto ocupe el ancho
  completo de la fila (en vez de quedar en el primer track de 240px por
  auto-placement implícito), manteniendo el mismo ritmo vertical y
  separadores (`border-top`) que las demás entradas. No-op en mobile (grid
  de una sola columna).
- src/pages/encargos.astro: el bloque `.prensa-media` ahora se renderiza
  siempre (antes era condicional), con la misma caja `aspect-ratio: 3/2`
  para imagen real o para un placeholder (`.prensa-media--placeholder`,
  fondo `--color-surface` + borde `--color-border`) que muestra el `tipo`
  del ítem centrado. Esto unifica el tratamiento visual de todos los ítems
  de la grilla `auto-fit` en vez de dejar el espacio de imagen vacío, para
  que ítems con y sin imagen convivan de forma prolija.
- Verificado con `npm run build` y con Playwright (instalado ad-hoc en el
  scratchpad, no es dependencia del proyecto): screenshots desktop y mobile
  de ambas páginas, usando las entradas de ejemplo existentes que ya cubrían
  ambos casos (expo-3/expo-4 y prensa-3/prensa-4 sin `imagen`).

Bloque 4 completo: efectos artísticos y microinteracciones. Pendiente de
revisión antes de seguir.
- Pincelada en el hero: nuevo componente src/components/HeroPincelada.astro
  + src/scripts/hero-carousel.js. Rota entre todas las obras `destacada: true`
  (antes la home solo usaba la primera como hero fijo); si no hay ninguna
  destacada, cae a la primera obra disponible como único slide estático. El
  barrido se logra con `mask-image` apuntando a un SVG de pincelada orgánica
  (public/brush-mask.svg, un blob con borde ondulado + salpicaduras, no un
  rectángulo/círculo) y animando `mask-position` (250% de ancho, de 150% a 0%)
  — no clip-path, para poder usar una forma con relleno "sólido" ancho sin
  tener que listar manualmente cada punto de un polígono. Controles discretos
  (dots + play/pause) ocultos por defecto y sin `hidden` recién al iniciar JS;
  autoplay cada 6s, pausable, y en pausa por hover. Fallback con `@supports
  not (mask-image)` a crossfade por opacity. Sin JS, el markup ya trae la
  primera obra destacada como `.is-active` (sin mask), así que se ve
  completa igual.
  - Bug no obvio (ya corregido): si la clase que agrega `transition:
    mask-position` es la MISMA clase que cambia el valor de mask-position
    (ej. pasar directo de "sin clases" a "is-incoming" con mask-position:150%
    en la misma regla), el propio cambio a 150% ya dispara una transición
    (desde el valor inicial 0%), que un frame después se corta al agregar
    "is-revealed" (target 0% de nuevo) — el resultado visual es un salto
    instantáneo en vez de un barrido de 900ms, porque la animación real
    quedó "gastada" en ese primer frame. La solución: el valor "oculto"
    (mask-position: 150%) vive en la regla base `.hero-slide` (sin
    transición), y `transition` se agrega recién en `.is-incoming` sin tocar
    el valor — así el único cambio de valor real ocurre al pasar a
    `.is-revealed`, y ese es el que se anima completo. Importante para
    cualquier futura animación disparada por clases: si agregar una clase
    cambia un valor Y agrega su propia transición al mismo tiempo, esa
    transición se dispara sola (desde el valor previo) y puede "comerse" la
    animación pensada para el paso siguiente.
- Microinteracciones: hover en ObraCard (src/components/ObraCard.astro) ahora
  suma una leve elevación (box-shadow + translateY) al zoom de imagen ya
  existente. Fade-in + stagger al entrar en viewport vía
  src/scripts/reveal.js (IntersectionObserver) sobre elementos `[data-reveal]`
  (secciones de la home, cards de galería, ítems de exposiciones/encargos,
  layout de sobre/contacto); el stagger es puramente por orden de hermanos
  dentro del mismo padre, sin depender del tipo de contenido. Nav
  (Header.astro) con subrayado animado (`::after` con `scaleX`) en hover/foco/
  página activa. Lightbox con transición de apertura/cierre (opacity + scale
  del panel), manejada en src/scripts/gallery.js con la misma técnica de
  forzar reflow + clase.
- Accesibilidad/perf: todo lo animado respeta `prefers-reduced-motion` vía una
  regla global en src/styles/global.css que fuerza duraciones a ~0 (además,
  el autoplay del hero se desactiva por completo con reduced-motion, no solo
  se acelera). Los `[data-reveal]` solo arrancan ocultos si `<html>` tiene la
  clase `js`, agregada por un script inline síncrono en el `<head>` de
  Layout.astro (antes de pintar el body) — sin JS esa clase nunca se agrega y
  el contenido queda visible por defecto (verificado con
  `javaScriptEnabled: false` en Playwright). Token nuevo en tokens.css:
  `--transition-slow` (900ms) para el barrido del hero.
- Verificado con `npm run build` y con Playwright (instalado ad-hoc, no es
  dependencia del proyecto — se desinstaló al terminar): screenshots
  desktop/mobile de home (estado inicial, mid-transición y post-transición
  del hero, reduced-motion, sin JS), hover de card, apertura/cierre del
  lightbox a mitad de transición, exposiciones y encargos con el fade-in ya
  disparado, y un scroll-through completo en mobile confirmando que ningún
  `[data-reveal]` queda en opacity 0 tras pasar por el viewport. Sin errores
  de consola.

Fix de layout del hero (post-Bloque 4): el hero de la home (index.astro +
HeroPincelada.astro) se rompió después del Bloque 4 — 4 bugs corregidos sin
tocar tokens.css ni la lógica del efecto de pincelada (mask-position/clases
is-incoming/is-revealed intactas):
- Imagen "zoomeada" perdiendo la composición: la causa era `object-fit: cover`
  en `.hero-slide img` combinado con un contenedor (`.hero-media` a 70vh/80vh)
  de proporción muy distinta a la de la obra — el crop resultante tapaba casi
  toda la pieza. Cambiado a `object-fit: contain` (src/components/
  HeroPincelada.astro): la obra se ve siempre completa, con el sobrante como
  "letterboxing" en `--color-surface` (el mismo fondo que ya tenía
  `.hero-media`, por eso el margen es casi invisible con las obras de
  ejemplo). Importante para el futuro: si se prefiere volver a un recorte
  tipo `cover` para fotos reales con proporciones más parecidas al hero, hay
  que revisar que el contenedor y la obra no difieran demasiado en relación
  de aspecto, o el mismo problema reaparece.
- Hero más alto que la ventana (controles/botones tapados sin scroll):
  `.hero` ahora mide `calc(100vh - var(--header-height))` en vez de una
  altura fija en vh independiente del header. `--header-height` es una
  custom property nueva (no en tokens.css — es un valor de layout, no de
  diseño) definida en src/components/Header.astro, medida con Playwright
  (`getBoundingClientRect`): 4.5rem (~72px) en mobile (con botón hamburguesa)
  y 4rem (~64px) en desktop, vía media query a 768px. `.hero` usa
  `grid-template-rows: minmax(0, 1fr) auto` (mobile, stack) — la fila de
  `.hero-info` se dimensiona por contenido y `.hero-media` ocupa el resto
  (`minmax(0, 1fr)`, el `0` es necesario para que el grid item pueda achicarse
  por debajo de su tamaño intrínseco), así el total nunca excede el alto
  disponible. Es 100% CSS, sin JS (se verificó también con
  `javaScriptEnabled: false`).
- Leyenda de la obra pegada al borde: `.hero-slide-caption` pasó de
  `left/bottom: var(--space-4)` a `var(--space-5)` (mobile) / `var(--space-7)`
  en `min-width: 768px` (src/components/HeroPincelada.astro) — mismo valor de
  padding-inline que usa `.container` (global.css), para que quede alineada
  con el título/texto de `.hero-info` en vez de un margen menor y
  desincronizado.
- Bloque de texto (nombre + botones) desalineado verticalmente: en
  `min-width: 768px`, `.hero-info` pasa a `display: flex; flex-direction:
  column; justify-content: center; padding-block: 0` y `height: 100%` (antes
  dependía de `align-items: center` en `.hero` + `padding-block` asimétrico
  de `.hero-info`, que técnicamente centraba la caja pero no el contenido
  visible dentro de ella, por el padding desigual arriba/abajo). En mobile
  se mantiene el `padding-block` original (space-6/space-8) porque ahí
  `.hero-info` es de altura automática (fila `auto` del grid), sin necesidad
  de centrado.
- Verificado con `npm run build` (6 páginas, sin errores) y con Playwright
  (instalado ad-hoc en el scratchpad, no es dependencia del proyecto — se
  desinstaló al terminar): mediciones de `getBoundingClientRect` en
  desktop/laptop/mobile confirmando que header+hero nunca excede el alto de
  ventana, screenshots desktop y mobile mostrando la obra completa (círculo/
  cuadrado de las obras placeholder ya no recortados), reduced-motion, sin
  JS, y transición de pincelada entre obras (Umbral/Silencio Ocre) sin
  regresiones. Sin errores de consola en ninguna página del sitio.

Carga de obras reales (post-Bloque 4): se reemplazaron las 4 obras de ejemplo
por las 17 imágenes reales de works/procesadas (copiadas a
src/content/obras/images/, el origen en works/procesadas no se tocó). Datos
provisorios — ver lista de PENDIENTEs más abajo, todavía falta confirmar con
la artista antes de publicar.
- 15 entradas .yaml (17 imágenes, ver caso especial más abajo), archivo
  nombrado con el slug de la obra (ej. bosque.yaml) en vez de obra-N.yaml.
  Título derivado mecánicamente del nombre de archivo en Title Case,
  corrigiendo solo ortografía evidente (tildes, "apartir" → "a partir"), sin
  agregar interpretación. Todas con `estado: "no_venta"` (sin precio, sin
  botón de compra) y sin `serie` hasta confirmar con la artista.
- Todo el resto del dato real (anio, tecnica, descripcion) es desconocido:
  `tecnica` y `descripcion` quedaron en `"PENDIENTE"` (string, permitido por
  el schema). `anio` es `z.number().int()` en content.config.ts —no admite un
  string— así que se usó `0` como valor centinela con un comentario YAML
  `# PENDIENTE` al lado; no se tocó el schema para mantener el cambio
  acotado a datos. Efecto colateral esperado y aceptado: estas obras
  ordenan al final en año descendente (galería/home) y aparecen con "0" como
  opción en el filtro de año hasta que se cargue el dato real.
- Caso especial: "batalla-en-el-jardin-1.jpg" y "-2.jpg" parecen ser las dos
  mitades de una misma obra, y
  "copia-de-sin-titulo-18-de-marzo-de-2025-22-12-25.jpg" parece mostrarla
  completa. Se unificaron en una sola entrada
  (src/content/obras/batalla-en-el-jardin.yaml): la completa como
  `imagenPrincipal`, las dos mitades como `imagenesDetalle`. **Supuesto sin
  confirmar** — anotado con comentario en el propio .yaml.
- "img-8918.jpg" no tiene nombre descriptivo (parece export de cámara/celular,
  no un título de la artista): se dejó el título mecánico "Img 8918" en vez
  de inventar uno, con nota en el .yaml para que se confirme el título real.
- 3 obras marcadas `destacada: true` (para que el hero y la sección de
  destacadas de la home tengan con qué rotar), elegidas objetivamente por
  resolución de imagen (no por criterio estético, que no me corresponde
  juzgar): "La creatividad a partir de la insidia" (2743×2762),
  "Luz y asfalto" (2336×3000) e "Img 8918" (3000×2098). A reconfirmar con la
  artista — probablemente quiera elegir las destacadas ella misma.
- Verificado con `npm run build` (6 páginas, sin errores).

### Obras cargadas — pendientes a confirmar con la artista

Las 15 obras siguientes tienen `anio` (centinela 0), `tecnica` y
`descripcion` en PENDIENTE. Título tentativo entre paréntesis:

1. batalla-en-el-jardin.yaml ("Batalla en el jardín") — además, confirmar el
   supuesto de unificación de las 3 imágenes (ver arriba).
2. bosque.yaml ("Bosque")
3. captando-el-movimiento-de-una-ciudad-dinamica.yaml ("Captando el
   movimiento de una ciudad dinámica")
4. complementarios.yaml ("Complementarios")
5. el-esqueleto.yaml ("El esqueleto")
6. idealizacion-del-bosque.yaml ("Idealización del bosque")
7. img-8918.yaml ("Img 8918") — además, confirmar título real (nombre de
   archivo no descriptivo).
8. la-creatividad-a-partir-de-la-insidia.yaml ("La creatividad a partir de la
   insidia")
9. luz-calida.yaml ("Luz cálida")
10. luz-y-asfalto.yaml ("Luz y asfalto")
11. paisaje.yaml ("Paisaje")
12. pensamientos-sumergidos.yaml ("Pensamientos sumergidos")
13. planta-y-hombre.yaml ("Planta y hombre")
14. sin-nombre.yaml ("Sin nombre")
15. temperatura.yaml ("Temperatura")

Todas además sin `dimensiones`, sin `precio`, sin `serie`, en
`estado: "no_venta"`. Confirmar también si las 3 `destacada: true` elegidas
por resolución son las que la artista quiere mostrar en el hero.

Próximo: a confirmar con la artista/dev antes de seguir con cualquier bloque
nuevo.

Fixes post-carga de obras reales: leyenda del hero ilegible, año "0"
visible, nombre real de la artista.
- Leyenda del hero: el título/año sobre la obra (abajo a la izquierda en
  HeroPincelada.astro) podía quedar ilegible según la zona de la pintura que
  cayera debajo (texto claro sobre pintura clara). Se agregó
  `.hero-slide-scrim`, un `<div>` con `linear-gradient(to top, ...)` que va
  de semi-oscuro (opacity 0.68) en el borde inferior a transparente al 45%
  de la altura del slide — no una caja sólida, así que no tapa la obra, solo
  oscurece sutilmente la franja donde vive el texto. Es hijo del mismo
  `<figure class="hero-slide">` que la imagen y el `<figcaption>`, así que
  queda sujeto a la misma máscara de pincelada que ya existía (se revela
  junto con el resto del slide, sin lógica nueva de JS). Funciona igual de
  bien sobre obras oscuras (ej. "Luz y asfalto") que claras (ej. "Img
  8918"), verificado con screenshots de ambas.
- Año "0" (centinela de `anio` PENDIENTE, ver sección de arriba) ya no se
  muestra en ningún lado: se condicionó a `anio > 0` en la leyenda del hero
  (HeroPincelada.astro), en la meta de ObraCard.astro, en las tarjetas de
  "Obras destacadas" de la home (index.astro — se había pasado por alto en
  el primer paso porque usan markup propio en vez de ObraCard) y en el JS
  del lightbox (gallery.js, que arma el mismo texto a partir de
  `data-anio`). Cuando el año es 0 se muestra solo la técnica, sin separador
  " · " colgando. El filtro de año en Filters.astro sigue mostrando "0"
  como opción (no se tocó, fuera del alcance pedido) — ya estaba
  documentado como efecto colateral esperado en la sección de arriba.
- Nombre real de la artista: `siteConfig.artistName` ('Nombre Artista' →
  'Pilar Gómez') y nuevo `siteConfig.artistFullName` ('María del Pilar
  Gómez') en site.ts. La mayoría de los usos (Header, Footer.footer-name,
  home, SEO/Open Graph vía Layout.astro, títulos de todas las páginas) usan
  `artistName` (display, corto) sin cambios de código — ya referenciaban la
  constante, así que heredan el nombre real automáticamente. Se usó
  `artistFullName` en dos lugares puntuales, más formales: el copyright del
  footer (Footer.astro) y el `<h1>`/alt de la foto en /sobre (sobre.astro).
  Es una decisión de criterio (el pedido no especificaba dónde usar cada
  variante) — fácil de ajustar si la artista prefiere el nombre completo en
  otro lugar o el corto en estos dos.
- Verificado con `npm run build` (6 páginas, sin errores) y con Playwright
  (instalado ad-hoc sobre `npm run preview`, no es dependencia del
  proyecto — se desinstaló al terminar): texto de body sin "Nombre Artista"
  ni años "0" sueltos, capturas del hero en dos obras con fondos muy
  distintos (clara/oscura) confirmando legibilidad de la leyenda, captura
  del lightbox con una obra PENDIENTE (año oculto, técnica/descripción en
  "PENDIENTE"), captura de /sobre con el nombre completo, y home en mobile.
  Sin errores de consola.

Fix de 2 bugs en el lightbox (post-carga de obras reales): imagen recortada
y flash de la obra anterior al abrir otra.
- Imagen recortada: la causa no era CSS sino la generación de la imagen en sí.
  `imagenesLightbox` en ObraCard.astro llamaba `getImage({ src: img, width:
  1200, height: 1440 })` — pasar width Y height juntos hace que Astro use
  `fit: "cover"` por default y recorte la imagen fuente a esa proporción
  5:6 (la pensada para la card cuadrada de la grilla, no para el lightbox)
  antes de que llegara al navegador. Por eso "Batalla en el jardín" (un
  díptico apaisado) se veía con el panel izquierdo cortado: la imagen ya
  venía pre-recortada del build. Fix: `getImage({ src: img, width: 1600 })`
  sin `height` — Astro preserva la proporción real de la fuente y solo
  reescala por ancho. Además, en Lightbox.astro, `.lightbox-image` pasó de
  `width: 100%; height: auto; max-height: 70vh` a `max-width: 100%;
  max-height: 70vh; width: auto; height: auto` (con `object-fit: contain`
  como red de seguridad) — con el ancho también en auto, el navegador
  escala la imagen para respetar ambos límites (ancho y alto disponibles)
  sin forzar un box de proporción fija que luego haya que rellenar, así que
  cualquier orientación (vertical, horizontal, muy apaisada) se ve completa
  y sin deformar dentro de `.lightbox-stage` (que ya centraba con flexbox).
- Flash de la obra anterior: `setActiveIndex` en gallery.js cambiaba
  `imageEl.src` directamente; el navegador sigue pintando el frame decodeado
  previo del mismo `<img>` hasta que la nueva imagen termina de cargar, así
  que por un instante se veía la obra anterior superpuesta con los datos
  (título/thumbs) ya actualizados a la nueva. Fix: nueva clase `.is-ready`
  en Lightbox.astro (`opacity: 0` por defecto, `1` en `.is-ready`, transición
  ya combinada con la de `transform` que usa el zoom). `setActiveIndex`
  ahora saca `.is-ready` ANTES de tocar `src` (oculta el frame viejo al
  instante), y la vuelve a agregar recién en el evento `load`/`error` de la
  imagen nueva — con un contador `loadSeq` que descarta callbacks de cargas
  ya obsoletas si el usuario clickea varias miniaturas/obras rápido seguidas
  (evita que una imagen vieja que tarda más en cargar "gane" y se muestre
  después de una más nueva). Caso borde: si se re-clickea la miniatura ya
  activa (mismo `src`), se marca `.is-ready` directo en vez de esperar un
  evento `load` que no va a volver a dispararse (el navegador no repite la
  descarga). Título/técnica/descripción/miniaturas no necesitaron el mismo
  tratamiento porque ya se actualizan de forma síncrona antes de que el
  panel se haga visible (`buildThumbs()` limpia `thumbsEl.innerHTML` primero,
  y los textos se pisan con `textContent` antes de sacar `hidden`), así que
  nunca llegan a mostrar el dato de la obra anterior.
- Verificado con `npm run build` (6 páginas, sin errores) y con Playwright
  (instalado ad-hoc sobre `npm run preview`, no es dependencia del
  proyecto — se desinstaló al terminar): script que abre "Batalla en el
  jardín" (apaisada, ratio 1.594) y "Luz y asfalto" (vertical, ratio 0.779)
  y compara `naturalWidth/naturalHeight` contra el bounding box renderizado
  (diff 0.000 en ambos casos, sin recorte ni distorsión), más un muestreo
  del `currentSrc`/`opacity` del `<img>` a 30 frames por transición (evento
  `requestAnimationFrame`) al abrir 7 obras distintas seguidas confirmando
  que la imagen anterior nunca queda visible con opacidad > 0 mientras carga
  la nueva. Screenshots de ambas obras confirmando visualmente el resultado.

Contacto de punta a punta (WhatsApp de testing + Web3Forms + obra de prueba
en venta): `whatsappNumber` en site.ts pasó a `5491144132345` (número de
testing, a reemplazar por el real de la artista). No hizo falta tocar
`whatsappLink`/`whatsappLinkParaObra` (ya usaban `encodeURIComponent`):
verificado en el HTML generado que tildes ("Quería" → `Quer%C3%ADa`),
comillas del título ("Bosque" → `%22Bosque%22`) y espacios (`%20`) quedan
bien codificados en los 3 puntos de contacto por WhatsApp (botón
"Consultar/Comprar" del lightbox vía `data-whatsapp` en ObraCard.astro,
botón de /contacto, link del footer) — ninguno arma el link a mano, todos
pasan por esas dos funciones de site.ts.
- Formulario de contacto conectado a Web3Forms: `contactForm.endpoint` en
  site.ts ahora apunta a `https://api.web3forms.com/submit`.
  **`contactForm.accessKey` quedó vacío (placeholder `// TODO`) porque no
  se pasó una key real** — el mensaje del pedido traía literalmente
  `[PEGAR ACÁ LA ACCESS KEY]` en vez de una key. Falta pegarla en site.ts
  antes de que los envíos reales funcionen (mientras tanto Web3Forms
  responde `success: false` por falta de `access_key`, y el form lo
  muestra como el estado de error ya implementado — no rompe nada, pero no
  entrega mensajes).
- Se agregó el campo "Asunto" (select: consulta sobre obra / encargo /
  exposición-colaboración / otro) a contacto.astro, pedido en el bloque
  pero ausente del maquetado original (que solo tenía nombre/email/mensaje).
  También un input hidden `subject` fijo (asunto del email que recibe la
  artista, distinto del campo visible "Asunto" que es el motivo de la
  consulta — Web3Forms igual reenvía ambos).
- El envío pasó de `<form action=... method="POST">` nativo a `fetch` en
  nuevo src/scripts/contact-form.js (mismo patrón que nav.js/gallery.js:
  JS mínimo, sin dependencias, un solo `<script src>` en contacto.astro).
  `action`/`method` se mantuvieron en el form igual (progressive
  enhancement: sin JS, todavía intenta un POST normal a Web3Forms en vez de
  no hacer nada). El form tiene `novalidate` para que sea el JS quien decida
  cuándo mostrar los errores nativos (`form.reportValidity()`), pero la
  validación en sí sigue siendo 100% nativa del navegador (`required` +
  `type="email"` en los inputs) — no se reimplementó a mano.
- Honeypot (`botcheck`, ya existía en el markup) ahora tiene lógica: si
  llegó con valor, el JS finge éxito y no llama a `fetch` (no le da
  feedback distinto a un bot que confirme que fue detectado).
- Estados visibles en `#form-status` (`role="status"`, `aria-live="polite"`)
  vía atributo `data-state` (`sending`/`success`/`error`) + color por
  estado en el `<style>` de contacto.astro. Se agregó un único token nuevo
  en tokens.css, `--color-error`, porque no existía ningún color semántico
  de error en la paleta (antes solo neutros + el acento terracota) y
  reusar el acento para error hubiera confundido "error" con "acción
  primaria/éxito".
- Obra de prueba en venta: **`src/content/obras/bosque.yaml`** — `estado`
  pasado de `"no_venta"` a `"disponible"` con `precio: 45000` (ambas líneas
  marcadas `# TEMPORAL` en el propio archivo). Revertir a `estado:
  "no_venta"` y borrar la línea `precio` cuando termine el testing.
- Verificado con `npm run build` (6 páginas, sin errores) y con Playwright
  (instalado ad-hoc sobre `npm run preview`, no es dependencia del
  proyecto — se desinstaló al terminar): interceptando la llamada a
  `api.web3forms.com/submit` se probaron los 4 casos del form (submit
  vacío no dispara `fetch`, éxito con mock 200 pasa por `sending` →
  `success` y limpia los campos, error con mock 400 muestra el estado de
  error, honeypot con valor no dispara `fetch` y finge éxito), más el botón
  de compra de "Bosque" en el lightbox (precio "$ 45.000", panel de compra
  visible, `href` de WhatsApp bien armado) y el link del footer en
  /contacto. Sin errores de consola.

## Notas de entorno
- Windows, dev server con `npm run dev` en modo foreground (no usar `astro dev --background` salvo que se pida explícitamente).
- `npm run dev` en Astro 7 deja un proceso daemon corriendo en segundo plano
  aunque no se pase `--background` (`astro dev status` / `astro dev stop` /
  `astro dev logs` lo controlan). Si un dev server queda corriendo de una
  sesión anterior y no refleja cambios nuevos en content collections (p. ej.
  páginas en blanco para una collection recién creada), no alcanza con
  esperar el watcher: hay que `astro dev stop` y volver a levantarlo.
- Documentación de Astro: https://docs.astro.build
  - [Rutas y páginas](https://docs.astro.build/en/guides/routing/)
  - [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
  - [Content collections](https://docs.astro.build/en/guides/content-collections/)
  - [Estilos](https://docs.astro.build/en/guides/styling/)
