import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.env.BUILD_DIR || 'dist');
const domain = 'https://koderyx.com.ar';
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  return nested.flat();
}
const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const problems = [];
const check = (condition, message) => { if (!condition) problems.push(message); };
for (const file of htmlFiles) {
  if (file === join(root, '__forms.html')) continue;
  const html = await readFile(file, 'utf8');
  const path = file.slice(root.length).replace(/\/index\.html$/, '') || '/';
  pages.set(path, html);
  const template = path.startsWith('/regalos/plantillas/');
  check(/<html[^>]*lang="es-AR"/.test(html), `${path}: falta lang es-AR`);
  check((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${path}: debe tener un único H1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  check(Boolean(title) && !titles.has(title), `${path}: title ausente o duplicado`);
  titles.add(title);
  const description = html.match(/name="description" content="([^"]+)"/)?.[1];
  check(Boolean(description) && !descriptions.has(description), `${path}: description ausente o duplicada`);
  descriptions.add(description);
  if (template) {
    check(/name="robots" content="noindex,\s*follow"/.test(html), `${path}: la demo debe conservar noindex`);
    check(html.includes('href="/regalos"'), `${path}: falta el enlace de regreso al catálogo`);
    check(!html.includes('/private/regalos/'), `${path}: referencia archivos privados`);
    continue;
  }
  check(html.includes(`rel="canonical" href="${domain}${path.replace('/404.html', '/404')}"`), `${path}: canonical incorrecto`);
  for (const field of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:image']) check(html.includes(`="${field}"`), `${path}: falta ${field}`);
  const utility = ['/404.html', '/gracias'].includes(path);
  check(utility ? html.includes('noindex, follow') : html.includes('index, follow, max-image-preview:large'), `${path}: robots incorrecto`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { const data = JSON.parse(json); check(data['@graph'].some(item => item['@type'] === 'Organization'), `${path}: falta Organization`); } catch { problems.push(`${path}: JSON-LD inválido`); }
  }
}
const sitePages = new Map([...pages].filter(([path]) => !path.startsWith('/regalos/plantillas/')));
const giftCatalog = sitePages.get('/regalos') || '';
check(giftCatalog.includes('"@type":"CollectionPage"'), '/regalos: falta schema CollectionPage');
check((giftCatalog.match(/"@type":"ListItem"/g) || []).length === 5, '/regalos: el schema debe listar cinco experiencias');
check(giftCatalog.includes('wa.me/5493624701036'), '/regalos: WhatsApp comercial incorrecto');
check(!files.some(file => file.includes('/private/regalos/')), 'El archivo privado apareció en dist');
let checkedLinks = 0;
for (const [path, html] of sitePages) {
  for (const [, , raw] of html.matchAll(/(?:href|src)=(['"])(.*?)\1/g)) {
    const href = raw.replaceAll('&amp;', '&');
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const url = new URL(href, domain + path);
    let target = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
    const targetHtml = pages.get(target);
    if (url.hash && targetHtml) {
      const id = decodeURIComponent(url.hash.slice(1));
      check(targetHtml.includes(`id="${id}"`), `${path}: ancla inexistente ${href}`);
    }
    if (!targetHtml) {
      try { await stat(join(root, target)); } catch { problems.push(`${path}: recurso o enlace roto ${href}`); }
    }
    checkedLinks++;
  }
}
const expectedFields = ['form-name', 'bot-field', 'name', 'company', 'email', 'phone', 'project-type', 'budget', 'message'];
const formDefinition = await readFile(join(root, '__forms.html'), 'utf8');
check(formDefinition.includes('<form name="contact"') && formDefinition.includes('data-netlify="true"'), 'Definición estática de Netlify Forms ausente');
check(formDefinition.includes('netlify-honeypot="bot-field"'), 'Definición estática sin honeypot');
for (const name of expectedFields) check(formDefinition.includes(`name="${name}"`), `Definición estática sin campo ${name}`);
for (const path of ['/', '/contacto']) {
  const html = pages.get(path);
  check(html.includes('data-netlify="true"'), `${path}: Netlify Forms no detectado`);
  check(html.includes('netlify-honeypot="bot-field"'), `${path}: falta honeypot`);
  check(html.includes('action="/gracias"'), `${path}: acción incorrecta`);
  for (const name of expectedFields) check(html.includes(`name="${name}"`), `${path}: falta campo ${name}`);
}
const faviconLinks = [
  '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
  '<link rel="icon" href="/favicon.ico">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
];
for (const [path, html] of sitePages) {
  for (const link of faviconLinks) check(html.includes(link), `${path}: falta referencia de favicon ${link}`);
}
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
for (const [name, size] of [['favicon-48x48.png', 48], ['favicon-96x96.png', 96], ['apple-touch-icon.png', 180]]) {
  const bytes = await readFile(join(root, name));
  check(bytes.subarray(0, 8).equals(pngSignature) && bytes.readUInt32BE(16) === size && bytes.readUInt32BE(20) === size, `${name}: PNG cuadrado inválido`);
}
const ico = await readFile(join(root, 'favicon.ico'));
check(ico.readUInt16LE(2) === 1 && ico.readUInt16LE(4) >= 3, 'favicon.ico inválido');
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
check(robots.includes('Allow: /') && robots.includes(`${domain}/sitemap-index.xml`), 'robots.txt incorrecto');
check(!/Disallow:\s*\/(?:favicon|apple-touch-icon)/i.test(robots), 'robots.txt bloquea el favicon');
const sitemap = await readFile(join(root, 'sitemap-0.xml'), 'utf8');
check(!sitemap.includes('/regalos/plantillas/'), 'sitemap: las demos no deben indexarse');
for (const path of sitePages.keys()) if (!['/gracias', '/404.html'].includes(path)) check(sitemap.includes(`<loc>${domain}${path === '/' ? '/' : path}</loc>`), `sitemap: falta ${path}`);
check(!sitemap.includes('/gracias') && !sitemap.includes('/404'), 'sitemap: páginas auxiliares incluidas');
assert.equal(problems.length, 0, problems.join('\n'));
console.log(`Verificación OK: ${sitePages.size} páginas Astro y ${pages.size - sitePages.size} demos, ${checkedLinks} enlaces/recursos, metadatos, JSON-LD, formularios, robots y sitemap.`);
