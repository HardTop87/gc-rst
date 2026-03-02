import { defineConfig } from 'vite';

export default defineConfig({
  // Root liegt im Projekt-Stammverzeichnis (index.html)
  root: '.',
  base: '/gc-rst/',

  build: {
    outDir:     'dist',
    emptyOutDir: true,
  },

  server: {
    open: true, // Browser beim Start automatisch öffnen
  },
});
