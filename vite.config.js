import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Root liegt im Projekt-Stammverzeichnis (index.html)
  root: '.',
  base: '/gc-rst/',

  build: {
    outDir:     'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dokumentation: resolve(__dirname, 'dokumentation.html'),
      },
    },
  },

  server: {
    open: true, // Browser beim Start automatisch öffnen
  },
});
