# ArtWork — portfolio de artista plástica

Sitio de portfolio estático hecho con [Astro](https://astro.build). No tiene CMS ni
panel de administración: cada obra es un archivo de datos que se edita a mano para
agregar contenido. La venta se resuelve con un botón que abre WhatsApp con un mensaje
pre-cargado (sin carrito ni checkout).

## Levantar el proyecto

Requiere Node >= 22.12.0.

```sh
npm install       # instala dependencias
npm run dev       # dev server en http://localhost:4321
npm run build     # build de producción a ./dist/
npm run preview   # sirve el build de ./dist/ localmente
```

## Cómo agregar una obra nueva

1. Copiá la imagen de la obra a `src/content/obras/images/`.
2. Creá un archivo `src/content/obras/<slug-de-la-obra>.yaml` con estos campos:

   ```yaml
   titulo: "Título de la obra"
   anio: 2024
   tecnica: "Óleo sobre lienzo"
   dimensiones: "80 x 100 cm" # opcional (no aplica a obras digitales)
   tipo: "fisica" # "fisica" | "digital", default "fisica"
   serie: "Nombre de la serie" # opcional
   estado: "disponible" # "disponible" | "vendida" | "no_venta"
   precio: 45000 # opcional, solo si estado es "disponible"
   imagenPrincipal: "./images/<archivo>.jpg"
   imagenesDetalle: [] # rutas a detalles/fotos adicionales, mismo formato
   descripcion: "Texto descriptivo de la obra."
   destacada: false # true para que aparezca en el hero/destacadas de la home
   ```

3. Corré `npm run build` para verificar que no haya errores de validación de datos.

El mismo patrón aplica a `src/content/exposiciones/` y `src/content/prensa/` (una
entrada por archivo), con sus propios campos definidos en `src/content.config.ts`.

## Estructura relevante

- `src/config/site.ts` — datos globales del sitio (nombre, contacto, WhatsApp, bio).
- `src/content/` — datos y assets de obras, exposiciones y prensa.
- `src/pages/` — páginas del sitio.
- `src/styles/tokens.css` — tokens de diseño (color, tipografía, espaciado).

Para más detalle sobre arquitectura y decisiones de diseño, ver `AGENTS.md`.
