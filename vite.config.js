import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        costars: resolve(__dirname, 'pages/costars.html'),
        multiagent: resolve(__dirname, 'pages/multi-agent.html'),
        apk: resolve(__dirname, 'pages/apk-archeologist.html'),
      },
    },
  },
  server: {
    port: 4000,
  },
});
