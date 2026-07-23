/**
 * Configuración global del sitio. Único lugar para editar estos datos.
 */
export const siteConfig = {
  artistName: 'Pilar Gómez',
  artistFullName: 'María del Pilar Gómez',
  tagline: 'Obra plástica',
  /**
   * Número de WhatsApp en formato internacional, solo dígitos
   * (sin '+', espacios ni guiones). Ej: 5491122334455
   */
  whatsappNumber: '5491144132345',

  email: 'contacto@nombreartista.com',

  socials: {
    instagram: 'https://instagram.com/nombreartista',
    facebook: '',
  },

  /**
   * Textos de la artista, centralizados acá para no hardcodearlos en el HTML.
   * `bio.extracto` se usa en la home; `bio.parrafos` es la bio completa de /sobre.
   */
  bio: {
    extracto:
      'Trabaja principalmente en óleo y técnicas mixtas, explorando el paisaje como territorio emocional. Su obra combina encargos físicos con ilustración digital para cine.',
    parrafos: [
      'Nació y trabaja en Argentina. Su formación combina estudios de bellas artes con años de práctica en taller, y su obra se mueve entre la pintura de caballete y encargos digitales para cortometrajes y colaboraciones editoriales.',
      'Sus series exploran el paisaje como territorio emocional: capas translúcidas, superposición de planos y una paleta reducida que privilegia la atmósfera por sobre el detalle.',
      'Expone de forma individual y colectiva desde hace más de una década, y su trabajo ha aparecido en publicaciones y producciones audiovisuales independientes.',
    ],
  },

  statement:
    'Pinto para entender el lugar donde termina el paisaje y empieza lo que sentimos frente a él. Cada obra parte de una observación concreta —una luz, una textura, un recorrido— que se disuelve en capas hasta volverse otra cosa: no una descripción del lugar, sino su residuo emocional.',

  contactForm: {
    /**
     * Endpoint del formulario de contacto. Dejar vacío hasta conectar.
     * - Web3Forms: 'https://api.web3forms.com/submit'
     * - Formspree: 'https://formspree.io/f/xxxxxxx'
     */
    endpoint: 'https://api.web3forms.com/submit',
    /** Solo para Web3Forms: se envía como campo oculto "access_key". Dejar vacío si se usa Formspree. */
    accessKey: '', // TODO: pegar la access key real de Web3Forms acá
  },
} as const;

/** Link de WhatsApp con mensaje pre-cargado. */
export function whatsappLink(mensaje: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
}

/** Link de WhatsApp con mensaje pre-cargado para consultar/comprar una obra puntual. */
export function whatsappLinkParaObra(titulo: string): string {
  return whatsappLink(`Hola! Me interesa la obra "${titulo}".`);
}
