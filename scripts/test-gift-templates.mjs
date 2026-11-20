import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve('dist');
const base = 'https://gift-templates.test';
const slugs = ['reconciliacion', 'pedido-noviazgo', 'feliz-cumpleanos', 'invitacion-cumpleanos', 'propuesta-matrimonio'];
const sample = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#71917b"/><circle cx="320" cy="240" r="120" fill="#eed9b0"/></svg>');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--no-sandbox'] });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const errors = [], checks = [];
await context.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  assert.equal(url.origin, base, 'Templates must stay self-contained during this test');
  const file = resolve(root, '.' + url.pathname);
  assert(file.startsWith(root + '/'));
  if (url.pathname.endsWith('/missing.jpg')) return route.fulfill({ status: 404, body: '' });
  const extension = extname(file);
  let body = await readFile(file);
  let html = extension === '.html' ? body.toString('utf8') : null;
  const variant = url.searchParams.get('photos');
  if (variant && html) {
    const match = html.match(/const CONFIG = (\{.*?\n\});/s);
    const config = JSON.parse(match[1]);
    config.fotos = variant === 'empty' ? [] : Array.from({ length: variant === 'many' ? 25 : 8 }, (_, i) => ({
      src: variant === 'broken' && i === 0 ? 'missing.jpg' : sample,
      pie: `Recuerdo ${i + 1}`, alt: `Fotografía de prueba ${i + 1}`,
    }));
    html = html.replace(match[0], 'const CONFIG = ' + JSON.stringify(config) + ';');
    body = Buffer.from(html);
  }
  const contentTypes = { '.html': 'text/html', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
  await route.fulfill({ contentType: contentTypes[extension] ?? 'application/octet-stream', body });
});
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('reports/templates', { recursive: true });
const noOverflow = async (label) => {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll('main *')].filter((element) => {
      if (getComputedStyle(element).display === 'none') return false;
      const rect = element.getBoundingClientRect();
      let left = rect.left, right = rect.right;
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (!['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) continue;
        const bounds = parent.getBoundingClientRect();
        left = Math.max(left, bounds.left); right = Math.min(right, bounds.right);
      }
      return right > left && (left < -1 || right > width + 1);
    }).map((element) => element.tagName + '.' + element.className);
  });
  assert.deepEqual(overflow, [], label);
};

try {
  for (const slug of slugs) {
    const url = `${base}/regalos/plantillas/${slug}.html`;
    const original = await readFile(resolve(root, `regalos/plantillas/${slug}.html`), 'utf8');
    const config = JSON.parse(original.match(/const CONFIG = (\{.*?\n\});/s)[1]);
    assert.equal(config.fotos.length, 8);
    assert.equal(new Set(config.fotos.map((photo) => photo.pie)).size, 8);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url);
      assert.equal(await page.locator('[data-photo-group] figure').count(), 8);
      assert.equal(await page.locator('[data-photo-group] img').count(), 8);
      for (const image of await page.locator('[data-photo-group] img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode());
      }
      assert(await page.locator('[data-photo-group] img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), 'Default demo photos must load');
      assert.equal(await page.locator('h1').count(), 1);
      const distribution = await page.locator('[data-photo-group]').evaluateAll((groups) => ({
        counts: groups.map((group) => group.querySelectorAll('figure').length),
        sections: new Set(groups.map((group) => group.closest('section'))).size,
      }));
      assert.deepEqual(distribution.counts, [2, 2, 2, 2]);
      assert.equal(distribution.sections, 4, 'Each pair needs a distinct content section');
      const captions = await page.locator('[data-photo-group] figcaption').evaluateAll((items) => items.map((item) => item.firstChild.textContent));
      assert.deepEqual(captions, config.fotos.map((photo) => photo.pie), 'Reading order must match CONFIG.fotos');
      await noOverflow(`${slug} at ${width}px`);
      const result = await new AxeBuilder({ page }).include('.memories-section').include('.keepsake-divider').include('[data-photo-group]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(result.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.failureSummary) })), [], `Accessibility: ${slug} ${width}`);
      checks.push({ slug, width, photos: 8, overflow: false, accessibility: 'passed' });
      if ([390, 1440].includes(width)) {
        for (let group = 0; group < 4; group++) {
          await page.locator('[data-photo-group]').nth(group).screenshot({ path: `reports/templates/${slug}-pair-${group + 1}-${width}.png` });
        }
        await page.locator('.memories-section').screenshot({ path: `reports/templates/${slug}-gallery-${width}.png` });
        await page.locator('.hero').screenshot({ path: `reports/templates/${slug}-hero-${width}.png` });
        if (await page.locator('.letter').count()) await page.locator('#carta').screenshot({ path: `reports/templates/${slug}-letter-${width}.png` });
      }
    }
    // Exercise the existing interactions, without opening any external links.
    if (slug === 'reconciliacion') {
      await page.locator('#memoryGame button').first().click();
      assert(!(await page.locator('#memoryGame button').first().getAttribute('aria-label')).includes('boca abajo'));
      await page.locator('#resetMemory').click();
      assert.equal(await page.locator('#memoryGame button').count(), 8);
      assert.equal(await page.locator('#memoryStatus').textContent(), '0 de 4 parejas.');
    } else if (slug === 'feliz-cumpleanos') {
      await page.locator('#gift').click();
      assert(await page.locator('#surprise').isVisible());
      assert.equal(await page.locator('#gift').getAttribute('aria-expanded'), 'true');
    } else if (slug === 'invitacion-cumpleanos') {
      assert(await page.locator('#countdown').isVisible());
      assert((await page.locator('#maps').getAttribute('href')).startsWith('https://www.google.com/maps/search/'));
      assert((await page.locator('#rsvp').getAttribute('href')).startsWith('https://wa.me/5493624701036'));
    } else {
      await page.locator('#revealQuestion').click();
      assert(await page.locator('#question').isVisible());
      await page.locator('#answerYes').click();
      assert.equal(await page.locator('#answer').textContent(), config.respuestaSi);
      await page.locator('#answerNo').click();
      assert.equal(await page.locator('#answer').textContent(), config.respuestaNo ?? config.respuestaDespues);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url + '?photos=real');
    const first = page.locator('[data-photo-group] button').first();
    assert.equal(await page.locator('[data-photo-group] button').count(), 8);
    await first.click();
    await page.locator('#lightImage').evaluate((img) => img.decode());
    assert(await page.locator('#lightbox').isVisible());
    assert.equal(await page.locator('#lightImage').getAttribute('alt'), 'Fotografía de prueba 1');
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#lightbox').isVisible()));
    assert(await first.evaluate((button) => button === document.activeElement));
    await page.locator('[data-photo-group] button').last().click();
    assert.equal(await page.locator('#lightCaption').textContent(), 'Recuerdo 8');
    await page.locator('#closeLightbox').click();
    await noOverflow(`${slug} with loaded photos`);
    await page.goto(url + '?photos=empty');
    assert.equal(await page.locator('[data-photo-group] figure').count(), 8, 'Empty config needs eight placeholders');
    await page.goto(url + '?photos=many');
    assert.equal(await page.locator('[data-photo-group] figure').count(), 25, 'Premium photos must not be truncated');
    assert.deepEqual(await page.locator('[data-photo-group]').evaluateAll((groups) => groups.map((group) => group.querySelectorAll('figure').length)), [7, 6, 6, 6]);
    await noOverflow(`${slug} with 25 photos`);
    await page.goto(url + '?photos=broken');
    await page.locator('[data-photo-group] figure').first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-photo-group] small').textContent === 'Foto no disponible');
    assert.equal(await page.locator('[data-photo-group] figure').count(), 8);
  }
  assert.deepEqual(errors, []);
  console.log('Plantillas OK: 5 plantillas con 8 fotos en cuatro secciones distintas, 20 vistas responsive/accesibles, ampliación y teclado, 25 fotos, fallback e interacciones existentes.');
} finally {
  await writeFile('reports/templates/results.json', JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
