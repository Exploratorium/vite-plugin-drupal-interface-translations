import rollupPluginDrupalInterfaceTranslations from 'rollup-plugin-drupal-interface-translations';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/main.js',
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
      plugins: [rollupPluginDrupalInterfaceTranslations()],
    },
  },
});
