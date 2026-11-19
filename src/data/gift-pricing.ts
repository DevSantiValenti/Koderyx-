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
    features: ['Todo lo del Intermedio, más:', 'Hasta 25 fotografías en total', 'Una experiencia interactiva a elección', 'Video o mensaje de voz personalizado', 'Transiciones y animaciones especiales', 'Código QR que abre la página', 'Tres rondas de correcciones en total'],
  },
] as const;

export const giftExtras = [
  { id: 'musica', name: 'Música de fondo', price: 5000, repeatable: false },
  { id: 'fotos', name: 'Hasta 10 fotos adicionales', price: 5000, repeatable: true },
  { id: 'video', name: 'Video personalizado integrado', price: 7000, repeatable: false },
  { id: 'carta', name: 'Carta sorpresa animada', price: 7000, repeatable: false },
  {
    id: 'qr',
    name: 'Código QR para abrir la página',
    description: 'Al escanearlo con la cámara del celular abre directamente el enlace de la página-regalo. Se entrega como imagen lista para compartir o imprimir.',
    price: 4000,
    repeatable: false,
  },
  { id: 'correcciones', name: 'Ronda adicional de correcciones', price: 4000, repeatable: true },
] as const;

export const giftSurprises = [
  {
    id: 'caja',
    name: 'Regalo virtual interactivo',
    optionLabel: 'Regalo virtual · Caja sorpresa animada',
    type: 'Caja sorpresa animada',
    symbol: '◇',
    description: 'Una caja digital que se abre al tocarla y revela el contenido elegido con una animación especial.',
    interaction: 'La persona toca la caja, se abre la tapa y aparece una carta, una fotografía, un video, un audio o el mensaje final.',
    requirements: 'El mensaje de la sorpresa y el contenido que querés revelar. Puede ser texto, una foto, un video o un audio autorizado.',
    result: 'Una apertura animada personalizada, adaptable al celular y sin instalar ninguna aplicación.',
  },
  {
    id: 'historia',
    name: 'Nuestra historia',
    optionLabel: 'Nuestra historia · Línea de tiempo interactiva',
    type: 'Línea de tiempo interactiva',
    symbol: '♡',
    description: 'Un recorrido cronológico por las fechas, fotografías y momentos más importantes de la relación.',
    interaction: 'La persona avanza por una línea de tiempo y descubre cada etapa con su fecha, una breve historia y sus fotografías.',
    requirements: 'Entre 4 y 8 momentos en orden: fecha o período, título, texto breve y las fotos que acompañan cada recuerdo.',
    result: 'Una historia visual que se recorre de principio a fin y termina en una dedicatoria o sorpresa final.',
  },
  {
    id: 'minijuego',
    name: 'Minijuego personalizado',
    optionLabel: 'Minijuego · Preguntas, memoria o rompecabezas',
    type: 'Juego para desbloquear el mensaje',
    symbol: '✳',
    description: 'Una pequeña experiencia para jugar con recuerdos antes de descubrir el mensaje final.',
    interaction: 'Podés elegir preguntas sobre la pareja, tarjetas de memoria o un rompecabezas sencillo. Al completarlo se desbloquea la sorpresa.',
    requirements: 'Según el juego: preguntas y respuestas, pares de recuerdos o una fotografía para convertir en rompecabezas.',
    result: 'Un juego breve y personalizado que funciona directamente en el navegador y guarda el resultado solo en esa pantalla.',
  },
  {
    id: 'carta',
    name: 'Carta secreta',
    optionLabel: 'Carta secreta · Secuencia para descubrirla',
    type: 'Carta animada desbloqueable',
    symbol: '✉',
    description: 'Una carta oculta que se descubre después de completar una pequeña secuencia interactiva.',
    interaction: 'La persona sigue pistas o toca elementos en un orden simple; después, el sobre se abre y la carta aparece con una animación.',
    requirements: 'El texto completo de la carta, la firma y, si querés, una pista, una foto, un audio o un video para acompañarla.',
    result: 'Una revelación íntima y progresiva que puede cerrar con una pregunta, una dedicatoria o un contenido especial.',
  },
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
