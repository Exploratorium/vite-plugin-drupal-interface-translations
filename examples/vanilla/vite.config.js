import { defineConfig } from 'vite';
import vitePluginDrupalInterfaceTranslations from 'vite-plugin-drupal-interface-translations';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vitePluginDrupalInterfaceTranslations()],
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/main.js',
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
