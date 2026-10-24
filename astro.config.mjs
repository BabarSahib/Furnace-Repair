import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://furnacefixpros.com',
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory'
  }
});
