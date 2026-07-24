import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const obras = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/obras' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      anio: z.number().int(),
      tecnica: z.string(),
      dimensiones: z.string().optional(),
      tipo: z.enum(['fisica', 'digital']).default('fisica'),
      serie: z.string().optional(),
      estado: z.enum(['disponible', 'vendida', 'no_venta']),
      precio: z.number().nonnegative().optional(),
      imagenPrincipal: image(),
      imagenesDetalle: z.array(image()).default([]),
      descripcion: z.string(),
      destacada: z.boolean().default(false),
    }),
});

const exposiciones = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/exposiciones' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      lugar: z.string(),
      ciudad: z.string(),
      fecha: z.coerce.date(),
      tipo: z.enum(['individual', 'colectiva']),
      descripcion: z.string(),
      imagen: image().optional(),
    }),
});

const prensa = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/prensa' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      tipo: z.string(),
      anio: z.number().int(),
      descripcion: z.string(),
      imagen: image().optional(),
      link: z.string().url().optional(),
    }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/proyectos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      subtitulo: z.string(),
      tipo: z.enum(['libro_album', 'ilustracion', 'colaboracion', 'otro']),
      anio: z.number().int().optional(),
      descripcion: z.string().optional(),
      imagenPortada: image(),
      imagenes: z.array(image()),
    }),
});

export const collections = { obras, exposiciones, prensa, proyectos };
