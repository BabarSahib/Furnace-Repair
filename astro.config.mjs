import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://furnacefixpros.us',
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory'
  }
});
