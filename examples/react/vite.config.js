import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import drupalInterfaceTranslations from 'rollup-plugin-drupal-interface-translations';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/src/main.jsx',
      plugins: [drupalInterfaceTranslations()],
    },
  },
});
