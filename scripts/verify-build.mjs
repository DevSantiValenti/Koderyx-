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
  check(/<html[^>]*lang="es-AR"/.test(html), `${path}: falta lang es-AR`);
  check((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${path}: debe tener un único H1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  check(Boolean(title) && !titles.has(title), `${path}: title ausente o duplicado`);
  titles.add(title);
  const description = html.match(/name="description" content="([^"]+)"/)?.[1];
  check(Boolean(description) && !descriptions.has(description), `${path}: description ausente o duplicada`);
  descriptions.add(description);
  check(html.includes(`rel="canonical" href="${domain}${path.replace('/404.html', '/404')}"`), `${path}: canonical incorrecto`);
  for (const field of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:image']) check(html.includes(`="${field}"`), `${path}: falta ${field}`);
  const utility = ['/404.html', '/gracias'].includes(path);
  check(utility ? html.includes('noindex, follow') : html.includes('index, follow, max-image-preview:large'), `${path}: robots incorrecto`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { const data = JSON.parse(json); check(data['@graph'].some(item => item['@type'] === 'Organization'), `${path}: falta Organization`); } catch { problems.push(`${path}: JSON-LD inválido`); }
  }
}
let checkedLinks = 0;
for (const [path, html] of pages) {
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
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
check(robots.includes('Allow: /') && robots.includes(`${domain}/sitemap-index.xml`), 'robots.txt incorrecto');
const sitemap = await readFile(join(root, 'sitemap-0.xml'), 'utf8');
for (const path of pages.keys()) if (!['/gracias', '/404.html'].includes(path)) check(sitemap.includes(`<loc>${domain}${path === '/' ? '/' : path}</loc>`), `sitemap: falta ${path}`);
check(!sitemap.includes('/gracias') && !sitemap.includes('/404'), 'sitemap: páginas auxiliares incluidas');
assert.equal(problems.length, 0, problems.join('\n'));
console.log(`Verificación OK: ${pages.size} páginas, ${checkedLinks} enlaces/recursos, metadatos, JSON-LD, formularios, robots y sitemap.`);
