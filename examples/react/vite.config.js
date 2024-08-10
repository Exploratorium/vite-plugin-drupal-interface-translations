import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginDrupalInterfaceTranslations from 'vite-plugin-drupal-interface-translations';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginDrupalInterfaceTranslations()],
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/src/main.jsx',
    },
  },
});
