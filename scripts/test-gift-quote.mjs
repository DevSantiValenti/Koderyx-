import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { calculateGiftQuote, giftPlans, giftSurprises, giftExtras } from '../src/data/gift-pricing.ts';

// Money regressions: promotion off, included extras, upgrades and custom scope.
for (const plan of giftPlans) {
  const selection = { plan: plan.id, surprise: 'caja', extras: {} };
  assert.equal(calculateGiftQuote(selection, true).total, plan.launchPrice);
  assert.equal(calculateGiftQuote(selection, false).total, plan.price);
}
assert.equal(calculateGiftQuote({ plan: 'estandar', surprise: 'caja', extras: { musica: 1, fotos: 2, correcciones: 1 } }).total, 38900);
for (const surprise of giftSurprises) {
  const quote = calculateGiftQuote({ plan: 'premium', surprise: surprise.id, extras: { musica: 1, video: 1, qr: 1, [surprise.id]: 1 } });
  assert.equal(quote.total, 44900, `Premium must not double-charge ${surprise.id}`);
}
const custom = calculateGiftQuote({ plan: 'exclusivo', surprise: 'carta', extras: { qr: 1 } });
assert.equal(custom.total, 93000);
assert.equal(custom.deposit, 46500);
assert.equal(custom.photos, null);
assert.equal(custom.promotion, false);
assert.equal(calculateGiftQuote({ plan: 'estandar', surprise: '', extras: { fotos: -1, musica: NaN, correcciones: Infinity } }).total, 19900);

const root = resolve('dist');
const base = 'https://gift-quote.test';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--no-sandbox'] });
const errors = [], checks = [];
const context = await browser.newContext({ reducedMotion: 'reduce' });
async function serve(route) {
  const url = new URL(route.request().url());
  if (url.origin !== base) return route.abort();
  assert.equal(route.request().method(), 'GET', 'The quote must not submit customer data to a server');
  const file = resolve(root, '.' + url.pathname, extname(url.pathname) ? '' : 'index.html');
  assert(file.startsWith(root + '/'));
  await route.fulfill({ contentType: mime[extname(file)] || 'application/octet-stream', body: await readFile(file) });
}
await context.route('**/*', serve);
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('reports', { recursive: true });
try {
  await page.goto(base + '/regalos');
  const plan = page.locator('#gift-plan');
  const total = page.locator('.gift-total');
  const send = page.locator('[data-quote-send]');
  const amount = async () => Number((await total.textContent()).replace(/\D/g, ''));
  const message = async () => new URL(await send.getAttribute('href')).searchParams.get('text').replaceAll('\u00a0', '');
  assert.equal(await amount(), 19900);
  await page.locator('#gift-extra-musica').check();
  await page.locator('#gift-extra-fotos').selectOption('2');
  assert.equal(await amount(), 34900);
  await plan.selectOption('intermedio');
  assert.equal(await amount(), 39900);
  assert(await page.locator('#gift-extra-musica').isDisabled());
  assert(!(await page.locator('#gift-extra-musica').isChecked()));
  assert.match(await page.locator('[data-quote-summary]').textContent(), /Hasta 35 fotos/);
  await plan.selectOption('estandar');
  assert.equal(await amount(), 29900, 'An included extra must not silently reappear when downgrading');
  await page.locator('#gift-extra-fotos').selectOption('0');
  await page.locator('#gift-extra-minijuego').check();
  await page.locator('#gift-extra-carta').check();
  await plan.selectOption('premium');
  await page.locator('#gift-surprise').selectOption('minijuego');
  assert.equal(await amount(), 51900, 'Premium minigame is included; the additional letter costs 7000');
  assert(await page.locator('#gift-extra-minijuego').isDisabled());
  await page.locator('#gift-surprise').selectOption('carta');
  assert.equal(await amount(), 44900);
  assert(await page.locator('#gift-extra-carta').isDisabled());
  await page.locator('#gift-media').selectOption('Mensaje de voz personalizado');
  await page.locator('#gift-template').selectOption('invitacion-cumpleanos');
  await page.locator('#gift-name').fill('Ana & Juan');
  await page.locator('#gift-recipient').fill('María');
  await page.locator('#gift-date').fill('2026-12-25');
  await page.locator('#gift-notes').fill('Verde, canción propia & una dedicatoria <especial>.');
  await page.locator('#gift-duration').selectOption('extension');
  let text = await message();
  for (const expected of ['Premium', 'Estás invitado/a', 'Carta secreta', 'Mensaje de voz', 'Ana & Juan', 'María', '25/12/2026', '<especial>', '3 meses', 'Extensión solicitada', '$44.900', '$22.450', 'primeros 5 clientes', 'cuenta regresiva']) assert(text.includes(expected), `WhatsApp missing: ${expected}`);
  assert.equal(new URL(await send.getAttribute('href')).pathname, '/5493624701036');
  // Inspect the action without sending a real WhatsApp message.
  await page.evaluate(() => document.querySelector('[data-quote-send]').addEventListener('click', (event) => { event.preventDefault(); window.quoteClicked = true; }));
  await send.click();
  assert(await page.evaluate(() => window.quoteClicked));
  await plan.selectOption('exclusivo');
  assert.equal(await amount(), 90000);
  assert(await page.locator('#gift-template').isDisabled());
  assert(await page.locator('[data-premium-fields]').isHidden());
  text = await message();
  assert(text.includes('desde $90.000') || text.includes('Desde $90.000'));
  assert(!text.includes('Carta secreta'));
  assert(!text.includes('Estás invitado/a'));
  assert(!text.includes('lanzamiento'));
  for (const extra of giftExtras.filter((item) => !item.repeatable)) await page.locator(`#gift-extra-${extra.id}`).check();
  await page.locator('#gift-extra-fotos').selectOption('2');
  await page.locator('#gift-extra-correcciones').selectOption('2');
  assert.equal(await amount(), 140000);
  await page.locator('[data-quote-template="pedido-noviazgo"]').click();
  assert.equal(await plan.inputValue(), 'estandar');
  assert.equal(await page.locator('#gift-template').inputValue(), 'pedido-noviazgo');
  await page.locator('[data-quote-plan="premium"]').click();
  assert.equal(await plan.inputValue(), 'premium');
  // Stress the longest summary on narrow screens as well as the default state.
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
    const a11y = await new AxeBuilder({ page }).include('.gift-pricing').include('.gift-builder').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(a11y.violations, [], `Accessibility at ${width}px`);
    checks.push({ width, overflow: false, accessibility: 'passed' });
    if ([390, 1440].includes(width)) {
      await page.locator('#kdx-regalos-planes').screenshot({ path: `reports/regalos-planes-${width}.png` });
      await page.locator('#kdx-regalos-presupuesto').screenshot({ path: `reports/regalos-presupuesto-${width}.png` });
    }
  }
  await page.locator('#gift-plan').focus();
  await page.keyboard.press('Tab');
  assert(await page.locator('#gift-template').evaluate((element) => element === document.activeElement));
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  await noJS.route('**/*', serve);
  const fallback = await noJS.newPage();
  await fallback.goto(base + '/regalos');
  assert.equal(await fallback.locator('.gift-plan').count(), 3);
  assert(await fallback.locator('noscript a[href^="https://wa.me/"]').isVisible());
  assert(await fallback.locator('#gift-plan').isDisabled());
  assert(await fallback.locator('[data-quote-send]').isHidden());
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log('Regalos OK: cálculos, cambios de plan, extras incluidos, diseño exclusivo, mensaje WhatsApp, teclado, sin JavaScript y 5 tamaños con accesibilidad.');
} finally {
  await writeFile('reports/gift-quote-results.json', JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
