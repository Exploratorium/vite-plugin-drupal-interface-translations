import { join } from 'node:path';

import { defineConfig,  } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginDrupalInterfaceTranslations from '../../index';

// https://vitejs.dev/config/
export default defineConfig({
  name: 'foo',
  plugins: [
    react(),
    vitePluginDrupalInterfaceTranslations(),
  ],
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/src/main.jsx',
    },
  }
})
