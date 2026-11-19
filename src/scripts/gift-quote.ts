import { giftExtras, giftOffer, calculateGiftQuote, formatGiftPrice as money } from '../data/gift-pricing';
import { giftExperiences } from '../data/gifts';

export function initGiftQuote() {
  const root = document.querySelector<HTMLElement>('[data-gift-builder]');
  const form = root?.querySelector<HTMLFormElement>('[data-gift-form]');
  if (!root || !form) return;
  const select = (id: string) => form.querySelector<HTMLSelectElement>(`#gift-${id}`)!;
  const field = (id: string) => form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#gift-${id}`)!;
  const plan = select('plan');
  const template = select('template');
  const surprise = select('surprise');
  const media = select('media');
  const duration = select('duration');
  const summary = form.querySelector<HTMLElement>('[data-quote-summary]')!;
  const send = form.querySelector<HTMLAnchorElement>('[data-quote-send]')!;
  const extraInputs = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-extra]')];
  let previousSummary = '';
  const value = (id: string) => field(id).value.trim();
  const quantities = () => Object.fromEntries(extraInputs.map((input) => [
    input.dataset.extra!, input instanceof HTMLInputElement ? Number(input.checked) : Number(input.value),
  ]));

  function updateSurpriseDetails() {
    const selected = surprise.selectedOptions[0];
    if (!selected) return;
    const setText = (selector: string, value = '') => {
      const element = form!.querySelector<HTMLElement>(selector);
      if (element) element.textContent = value;
    };
    setText('[data-selected-symbol]', selected.dataset.symbol);
    setText('[data-selected-name]', selected.dataset.name);
    setText('[data-selected-type]', selected.dataset.type);
    setText('[data-selected-description]', selected.dataset.description);
    setText('[data-selected-interaction]', selected.dataset.interaction);
    setText('[data-selected-requirements]', selected.dataset.requirements);
    setText('[data-selected-result]', selected.dataset.result);
  }

  function update() {
    let quote = calculateGiftQuote({ plan: plan.value, surprise: surprise.value, extras: quantities() });
    extraInputs.forEach((input) => {
      const id = input.dataset.extra!;
      const included = quote.included.has(id);
      input.disabled = included;
      if (input instanceof HTMLInputElement && included) input.checked = false;
      const extra = giftExtras.find((item) => item.id === id)!;
      form!.querySelector<HTMLElement>(`[data-extra-price="${id}"]`)!.textContent = included
        ? id === 'video' ? 'Video o voz incluido en Premium' : 'Incluido en tu elección'
        : `${money(extra.price)}${extra.repeatable ? ' por unidad' : ''}`;
    });
    quote = calculateGiftQuote({ plan: plan.value, surprise: surprise.value, extras: quantities() });
    form!.querySelector<HTMLElement>('[data-premium-fields]')!.hidden = !quote.premium;
    surprise.disabled = media.disabled = !quote.premium;
    updateSurpriseDetails();
    template.disabled = quote.exclusive;
    form!.querySelector<HTMLElement>('[data-template-note]')!.textContent = quote.exclusive
      ? 'Diseño creado desde cero. La cantidad de fotos, las correcciones y las interacciones se definen al cotizar.'
      : 'Podés recorrer las demos y elegir una como punto de partida.';
    const templateName = quote.exclusive ? 'Diseño desde cero' : giftExperiences.find((item) => item.slug === template.value)?.title ?? 'A definir';
    const invitation = !quote.exclusive && template.value === 'invitacion-cumpleanos';
    form!.querySelector<HTMLElement>('[data-invitation-note]')!.hidden = !invitation;
    const extension = duration.value === 'extension';
    const prefix = quote.exclusive ? 'Desde ' : '';
    const capacity = quote.exclusive ? 'Fotos y correcciones: alcance a definir.'
      : `Hasta ${quote.photos} fotos · ${quote.corrections} ${quote.corrections === 1 ? 'ronda de correcciones' : 'rondas de correcciones'}`;
    const conditions = [
      ...(quote.promotion ? [`Precio de lanzamiento para los primeros ${giftOffer.places} clientes, sujeto a confirmación de cupo. Sin promoción, esta selección cuesta ${money(quote.total + quote.regularPrice - quote.basePrice)}.`] : []),
      ...(quote.exclusive ? ['Importe mínimo orientativo. El alcance y precio final del diseño exclusivo se confirman por WhatsApp.'] : []),
      ...(extension ? ['Extensión solicitada: se cotiza por separado y no está incluida en este importe.'] : []),
    ];
    // Use text nodes throughout: customer text must never be interpreted as HTML.
    const fragment = document.createDocumentFragment();
    const paragraph = (text: string, className = '') => {
      const element = document.createElement('p');
      element.className = className;
      element.textContent = text;
      fragment.append(element);
    };
    paragraph(quote.name, 'gift-summary-plan');
    paragraph(`Plantilla: ${templateName}`, 'gift-note');
    paragraph(capacity, 'gift-note');
    if (quote.surprise) paragraph(`Sorpresa incluida: ${quote.surprise.name} · ${quote.surprise.type}. ${media.value} incluido.`, 'gift-note');
    const list = document.createElement('dl');
    list.className = 'gift-breakdown';
    for (const [label, price] of [
      [`${quote.name}${quote.promotion ? ' · lanzamiento' : ''}`, `${prefix}${money(quote.basePrice)}`],
      ...quote.extras.map((extra) => [`${extra.name}${extra.quantity > 1 ? ` × ${extra.quantity}` : ''}`, money(extra.total)]),
    ]) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = price;
      row.append(term, detail);
      list.append(row);
    }
    fragment.append(list);
    paragraph(quote.exclusive ? 'Estimación inicial desde' : 'Total estimado · ARS', 'gift-total-label');
    paragraph(money(quote.total), 'gift-total');
    paragraph(`Anticipo 50%: ${prefix}${money(quote.deposit)}. Saldo 50%: ${prefix}${money(quote.deposit)}.`, 'gift-payments');
    paragraph(`${giftOffer.months} meses de publicación incluidos.`, 'gift-note');
    conditions.forEach((condition) => paragraph(condition, 'gift-summary-condition'));
    // Do not reannounce prices while the visitor is only typing their details.
    const nextSummary = fragment.textContent ?? '';
    if (nextSummary !== previousSummary) {
      summary.replaceChildren(fragment);
      previousSummary = nextSummary;
    }

    const date = value('date');
    const readableDate = date ? date.split('-').reverse().join('/') : 'A coordinar';
    const message = [
      '¡Hola, Koderyx! Armé este presupuesto para una página de regalo:',
      '',
      `Plan: ${quote.name}`,
      `Plantilla: ${templateName}`,
      `Base${quote.promotion ? ' de lanzamiento' : ''}: ${prefix}${money(quote.basePrice)} ARS`,
      capacity,
      ...(quote.surprise ? [
        `Experiencia Premium: ${quote.surprise.name} · ${quote.surprise.type}`,
        `Cómo funciona: ${quote.surprise.interaction}`,
        `Material necesario: ${quote.surprise.requirements}`,
        `Contenido incluido: ${media.value}`,
      ] : []),
      ...(invitation ? ['Invitación: fecha, ubicación, cuenta regresiva y confirmación por WhatsApp incluidas.'] : []),
      'Extras:',
      ...(quote.extras.length ? quote.extras.map((extra) => `• ${extra.name} × ${extra.quantity}: ${money(extra.total)}`) : ['Sin extras adicionales.']),
      '',
      `Total estimado: ${prefix}${money(quote.total)} ARS`,
      `Anticipo 50%: ${prefix}${money(quote.deposit)}. Saldo antes de publicar: ${prefix}${money(quote.deposit)}.`,
      `Vigencia: ${giftOffer.months} meses desde la publicación.`,
      ...conditions,
      '',
      ...(value('name') ? [`Mi nombre: ${value('name')}`] : []),
      ...(value('recipient') ? [`Para: ${value('recipient')}`] : []),
      `Fecha deseada: ${readableDate}`,
      ...(value('notes') ? [`Mi idea: ${value('notes')}`] : []),
      'Entiendo que las correcciones son ajustes sobre el diseño elegido, no rediseños completos.',
      'Quisiera confirmar disponibilidad, alcance y fecha de entrega.',
    ].join('\n');
    send.href = `https://wa.me/${root!.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
    send.hidden = false;
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.querySelectorAll<HTMLAnchorElement>('[data-quote-plan], [data-quote-template]').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.quotePlan) plan.value = link.dataset.quotePlan;
      if (link.dataset.quoteTemplate) {
        template.value = link.dataset.quoteTemplate;
        if (plan.value === 'exclusivo') plan.value = 'estandar';
      }
      update();
      plan.focus({ preventScroll: true });
    });
  });
  form.querySelector<HTMLFieldSetElement>('[data-gift-controls]')!.disabled = false;
  update();
}
