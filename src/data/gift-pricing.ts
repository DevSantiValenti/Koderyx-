// Desactivar manualmente al completar los primeros cinco pedidos promocionales.
// No hay contador de ventas ni reserva de cupos desde el navegador.
export const giftOffer = { active: true, places: 5, months: 3 };

export const giftPlans = [
  {
    id: 'estandar', name: 'Estándar', badge: 'Esencial', price: 24900, launchPrice: 19900,
    description: 'Para sorprender con una página personalizada, sencilla y emotiva.',
    photos: 8, corrections: 1, includes: [] as string[],
    features: ['Plantilla a elección', 'Nombres y textos personalizados', 'Hasta 8 fotografías', 'Colores y estilos disponibles a elección', 'Animaciones propias de la plantilla', 'Enlace exclusivo para compartir', 'Una ronda de correcciones'],
  },
  {
    id: 'intermedio', name: 'Intermedio', badge: 'Más elegido', price: 34900, launchPrice: 29900,
    description: 'Más emoción, una canción y espacio para compartir más recuerdos.',
    photos: 15, corrections: 2, includes: ['musica'],
    features: ['Todo lo del Estándar, más:', 'Una canción de fondo a elección*', 'Hasta 15 fotografías en total', 'Una sección adicional de recuerdos o dedicatorias', 'Efectos visuales adicionales', 'Dos rondas de correcciones en total'],
  },
  {
    id: 'premium', name: 'Premium', badge: 'Experiencia completa', price: 54900, launchPrice: 44900,
    description: 'Una experiencia con sorpresas e interacciones para descubrir.',
    photos: 25, corrections: 3, includes: ['musica', 'video', 'qr'],
    features: ['Todo lo del Intermedio, más:', 'Hasta 25 fotografías en total', 'Una experiencia interactiva a elección', 'Video o mensaje de voz personalizado', 'Transiciones y animaciones especiales', 'Código QR para compartir', 'Tres rondas de correcciones en total'],
  },
] as const;

export const giftExtras = [
  { id: 'musica', name: 'Música de fondo', price: 5000, repeatable: false },
  { id: 'fotos', name: 'Hasta 10 fotos adicionales', price: 5000, repeatable: true },
  { id: 'video', name: 'Video personalizado integrado', price: 7000, repeatable: false },
  { id: 'minijuego', name: 'Minijuego interactivo de plantilla', price: 10000, repeatable: false },
  { id: 'carta', name: 'Carta sorpresa animada', price: 7000, repeatable: false },
  { id: 'qr', name: 'QR personalizado', price: 3000, repeatable: false },
  { id: 'correcciones', name: 'Ronda adicional de correcciones', price: 4000, repeatable: true },
] as const;

export const giftSurprises = [
  { id: 'caja', name: 'Regalo virtual interactivo', symbol: '◇', description: 'Una caja que se abre al tocarla y revela una carta, una foto, un video o una sorpresa especial.' },
  { id: 'historia', name: 'Nuestra historia', symbol: '♡', description: 'Una línea de tiempo interactiva con fechas, fotografías y los momentos que los trajeron hasta acá.' },
  { id: 'minijuego', name: 'Minijuego personalizado', symbol: '✳', description: 'Preguntas, tarjetas de recuerdos o un pequeño rompecabezas que desbloquea el mensaje final.' },
  { id: 'carta', name: 'Carta secreta', symbol: '✉', description: 'Una carta animada que se abre después de completar una pequeña secuencia interactiva.' },
] as const;

export const exclusiveDesignPrice = 90000;
export const formatGiftPrice = (value: number) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
}).format(value);

export interface GiftQuoteSelection {
  plan: string;
  surprise: string;
  extras: Record<string, number>;
}

export function calculateGiftQuote(selection: GiftQuoteSelection, promotion = giftOffer.active) {
  const exclusive = selection.plan === 'exclusivo';
  const plan = giftPlans.find((item) => item.id === selection.plan) ?? giftPlans[0];
  const premium = !exclusive && plan.id === 'premium';
  const surprise = premium
    ? giftSurprises.find((item) => item.id === selection.surprise) ?? giftSurprises[0]
    : null;
  const included = new Set<string>(exclusive ? [] : plan.includes);
  if (surprise) included.add(surprise.id);
  const basePrice = exclusive ? exclusiveDesignPrice : promotion ? plan.launchPrice : plan.price;
  const extras = giftExtras.flatMap((extra) => {
    const requested = selection.extras[extra.id] ?? 0;
    const quantity = included.has(extra.id) || !Number.isFinite(requested)
      ? 0 : Math.min(extra.repeatable ? 10 : 1, Math.max(0, Math.floor(requested)));
    return quantity ? [{ ...extra, quantity, total: quantity * extra.price }] : [];
  });
  const total = basePrice + extras.reduce((sum, extra) => sum + extra.total, 0);
  const extraQuantity = (id: string) => extras.find((extra) => extra.id === id)?.quantity ?? 0;
  return {
    name: exclusive ? 'Diseño exclusivo desde cero' : plan.name,
    exclusive, premium, promotion: !exclusive && promotion, included, surprise,
    basePrice, regularPrice: exclusive ? exclusiveDesignPrice : plan.price,
    extras, total, deposit: total / 2,
    photos: exclusive ? null : plan.photos + extraQuantity('fotos') * 10,
    corrections: exclusive ? null : plan.corrections + extraQuantity('correcciones'),
  };
}
