export interface GiftExperience {
  slug: string;
  category: 'amor' | 'cumple';
  tag: string;
  title: string;
  description: string;
  previewClass: string;
  symbol: string;
  previewTitle: string[];
}

export const giftExperiences: GiftExperience[] = [
  {
    slug: 'reconciliacion',
    category: 'amor',
    tag: 'Reconciliación',
    title: 'Una segunda oportunidad',
    description: 'Palabras sinceras, recuerdos y un pequeño juego para compartir con calma.',
    previewClass: 'rec',
    symbol: '♡',
    previewTitle: ['Una segunda', 'oportunidad.'],
  },
  {
    slug: 'pedido-noviazgo',
    category: 'amor',
    tag: 'Pedido de noviazgo',
    title: '¿Querés ser mi novia/o?',
    description: 'Una declaración dulce, un poco de nervios y una pregunta especial.',
    previewClass: 'nov',
    symbol: '♡',
    previewTitle: ['Me gustás.', 'Así, simple.'],
  },
  {
    slug: 'feliz-cumpleanos',
    category: 'cumple',
    tag: 'Regalo de cumpleaños',
    title: 'Un regalo para vos',
    description: 'Recuerdos, confeti y una sorpresa que espera adentro de una caja.',
    previewClass: 'cum',
    symbol: '✦',
    previewTitle: ['Hoy el mundo', 'te celebra.'],
  },
  {
    slug: 'invitacion-cumpleanos',
    category: 'cumple',
    tag: 'Invitación de cumpleaños',
    title: 'Estás invitado/a',
    description: 'Una invitación con cuenta regresiva, ubicación y confirmación por WhatsApp.',
    previewClass: 'inv',
    symbol: '✳',
    previewTitle: ['La mejor parte:', 'que estés ahí.'],
  },
  {
    slug: 'propuesta-matrimonio',
    category: 'amor',
    tag: 'Propuesta de matrimonio',
    title: 'Para siempre con vos',
    description: 'Una historia cinematográfica para dar juntos el próximo gran paso.',
    previewClass: 'mat',
    symbol: '◇',
    previewTitle: ['Mi lugar favorito', 'es con vos.'],
  },
];