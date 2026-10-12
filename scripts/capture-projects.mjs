import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('reports', { recursive: true });
const browser = await chromium.launch({ ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), headless: true, args: ['--no-sandbox'] });
const sources = [
  { slug: 'sonrie-plus', url: 'https://riemas.com.ar/' },
  { slug: 'electrodental-nea', url: 'https://electrodentalnea.com.ar/' },
];
const results = [];
try {
  for (const source of sources) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
    try {
      await page.goto(source.url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      const buffer = await page.screenshot({ animations: 'disabled' });
      await sharp(buffer).webp({ quality: 90 }).toFile(`public/images/projects/${source.slug}-screen.webp`);
      results.push({ ...source, title: await page.title(), capturedAt: new Date().toISOString(), width: 1440, height: 960 });
    } catch (error) { results.push({ ...source, error: error.message }); }
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('reports/project-captures.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
