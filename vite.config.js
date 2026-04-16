import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    port: 4000,
  },
  // All routes serve index.html (single-page app)
  appType: 'spa',
});
