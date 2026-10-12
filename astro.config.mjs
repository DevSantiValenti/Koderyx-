import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://koderyx.com.ar',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap({
    filter: (page) => !/\/(gracias|404)\/?$/.test(page),
  })],
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
