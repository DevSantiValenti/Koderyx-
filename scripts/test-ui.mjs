import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

await mkdir('reports', { recursive: true });
const root = resolve('dist');
const base = 'https://koderyx.test';
const browser = await chromium.launch({ ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), headless: true, args: ['--no-sandbox'] });
const errors = [], checks = [], violations = [];
const routes = ['/', '/servicios', '/proyectos', '/proyectos/sonrie-plus', '/proyectos/electrodental-nea', '/proyectos/gimnasios', '/proyectos/turnero-facil', '/contacto', '/privacidad', '/gracias', '/404.html'];
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const posts = [], postPaths = [];
let failPost = false;
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.route(`${base}/**`, async route => {
  const request = route.request();
  if (request.method() === 'POST') {
    posts.push(new URLSearchParams(request.postData()));
    postPaths.push(new URL(request.url()).pathname);
    return route.fulfill({ status: failPost ? 503 : 200, contentType: 'text/html', body: 'Mock Netlify response; no external submission.' });
  }
  const path = decodeURIComponent(new URL(request.url()).pathname);
  const file = resolve(root, '.' + path, extname(path) ? '' : 'index.html');
  assert(file.startsWith(root));
  try { return await route.fulfill({ status: 200, contentType: mime[extname(file)] || 'application/octet-stream', body: await readFile(file) }); }
  catch { return await route.fulfill({ status: 404, body: 'Not found' }); }
});
await context.addInitScript(() => {
  window.__events = JSON.parse(sessionStorage.getItem('qa-events') || '[]');
  let gtagImpl = () => {};
  Object.defineProperty(window, 'gtag', {
    configurable: true,
    get: () => gtagImpl,
    set: fn => { gtagImpl = (...args) => { window.__events.push(args); sessionStorage.setItem('qa-events', JSON.stringify(window.__events)); fn(...args); }; },
  });
  // Verify click events without opening WhatsApp, Instagram or the founder's site.
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[target="_blank"]') : null;
    if (link) event.preventDefault();
  }, true);
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  for (const width of process.env.UI_INTERACTIONS_ONLY ? [] : [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of routes) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      const overflowing = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        return [...document.querySelectorAll('body *')].filter(element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== 'none' && style.position !== 'fixed' && rect.width > 0 && (rect.right > width + 1 || rect.left < -1);
        }).map(element => `${element.tagName}.${element.className}`);
      });
      assert.equal(overflowing.length, 0, `Overflow ${width}px ${path}: ${overflowing.join(', ')}`);
      checks.push({ width, path, overflow: false });
      if (width === 1440 && path === '/') {
        const cards = await page.locator('#proyectos .project-card').evaluateAll(elements => elements.map(element => ({ top: element.getBoundingClientRect().top, slug: element.querySelector('.project-image-link')?.getAttribute('href') })));
        assert.equal(cards.length, 4, 'La grilla debe mostrar cuatro proyectos');
        assert(cards.slice(0, 3).every(card => card.top === cards[0].top), 'Los primeros tres proyectos deben compartir fila');
        assert.equal(cards[3].slug, '/proyectos/turnero-facil');
        assert(cards[3].top > cards[0].top, 'Turnero Fácil debe iniciar la segunda fila');
        await page.locator('#proyectos .project-turnero-facil').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const images = [...document.querySelectorAll('#proyectos .project-turnero-facil img')];
          return images.length === 2 && images.every(image => image.complete && image.naturalWidth > 0);
        });
      }
      if ([390, 1440].includes(width) && ['/', '/contacto', '/proyectos/sonrie-plus', '/proyectos/electrodental-nea', '/proyectos/gimnasios', '/proyectos/turnero-facil', '/servicios', '/privacidad'].includes(path)) {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        violations.push(...result.violations.map(item => ({ width, path, id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })));
      }
      if ([390, 1440].includes(width) && path === '/') await page.screenshot({ path: `reports/home-${width}.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  const menu = page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert(await menu.evaluate(element => element === document.activeElement));
  await menu.click();
  await page.locator('#main-navigation').getByRole('link', { name: 'Servicios', exact: true }).click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  const question = page.locator('summary').first();
  await question.focus();
  await page.keyboard.press('Enter');
  assert(await question.evaluate(element => element.parentElement.open));
  await page.locator('.whatsapp-float').click();
  await page.locator('[data-event="click_portfolio"]').click();
  const events = await page.evaluate(() => window.__events);
  assert(events.some(event => event[1] === 'click_whatsapp'));
  assert(events.some(event => event[1] === 'click_portfolio'));
  assert(!events.some(event => event[1] === 'form_submit'));
  await page.locator('.hero-copy [data-event="click_presupuesto"]').click();
  await page.waitForURL(base + '/contacto');
  assert((await page.evaluate(() => window.__events)).some(event => event[1] === 'click_presupuesto'));
  await page.goto(base + '/proyectos/sonrie-plus');
  assert((await page.evaluate(() => window.__events)).some(event => event[1] === 'project_view' && event[2].project === 'sonrie-plus'));
  await page.goto(base + '/contacto?tipo=Ecommerce');
  assert.equal(await page.locator('#project-type').inputValue(), 'Ecommerce');
  await page.locator('button[type="submit"]').click();
  assert.equal(posts.length, 0, 'El formulario vacío no debe enviarse');
  const fill = async () => {
    await page.locator('#name').fill('Prueba local');
    await page.locator('#company').fill('Empresa de prueba');
    await page.locator('#email').fill('qa@example.com');
    await page.locator('#phone').fill('+54 362 0000000');
    await page.locator('#project-type').selectOption('Ecommerce');
    await page.locator('#message').fill('Esta es una prueba automatizada local del formulario. No se envía a Netlify.');
  };
  await fill();
  await page.locator('#phone').fill('telefono-invalido');
  assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
  await page.locator('#phone').fill('+54 (362) 000-0000');
  assert(await page.locator('form').evaluate(form => form.checkValidity()));
  failPost = true;
  await page.locator('button[type="submit"]').click();
  await page.locator('[data-form-status]:not([hidden])').waitFor();
  assert((await page.locator('[data-form-status]').textContent()).includes('No pudimos confirmar'));
  assert.equal(await page.locator('#name').inputValue(), 'Prueba local');
  assert.equal(await page.locator('button[type="submit"]').isDisabled(), false);
  assert(!(await page.evaluate(() => window.__events)).some(event => event[1] === 'form_submit'));
  failPost = false;
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(base + '/gracias');
  assert.equal(posts.at(-1).get('form-name'), 'contact');
  assert.equal(postPaths.at(-1), '/__forms.html');
  assert.equal(posts.at(-1).get('bot-field'), '');
  assert.equal(posts.at(-1).get('project-type'), 'Ecommerce');
  assert((await page.evaluate(() => window.__events)).some(event => event[1] === 'form_submit'));
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  await noJS.route(`${base}/**`, async route => {
    const path = new URL(route.request().url()).pathname;
    const file = resolve(root, '.' + path, extname(path) ? '' : 'index.html');
    await route.fulfill({ contentType: mime[extname(file)] || 'application/octet-stream', body: await readFile(file) });
  });
  const fallback = await noJS.newPage();
  await fallback.goto(base);
  assert(await fallback.locator('#main-navigation').isVisible());
  assert(await fallback.locator('form[name="contact"]').isVisible());
  await noJS.close();
} finally {
  await writeFile(process.env.UI_INTERACTIONS_ONLY ? 'reports/interaction-results.json' : 'reports/ui-results.json', JSON.stringify({ checks, violations, errors, mockSubmissions: posts.length }, null, 2));
  await browser.close();
}
// The intentional mocked HTTP 503 may be reported by Chromium; all other errors fail.
assert.deepEqual(errors.filter(error => !error.includes('503')), []);
assert.deepEqual(violations, [], 'Revisar reports/ui-results.json: accesibilidad');
console.log(`UI OK: ${checks.length} verificaciones responsive, teclado, menú, FAQ, proyecto, formulario (error y éxito simulados), sin JavaScript y auditorías de accesibilidad.`);
