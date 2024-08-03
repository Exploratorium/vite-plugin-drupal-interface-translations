# Vite Plugin for Drupal to Extract Interface Translations

This is a [vite](https://vitejs.dev) plugin that helps you to
[translation strings in JavaScript](https://www.drupal.org/docs/8/api/translation-api/overview#s-translation-in-javascript-files)
that are used in [Drupal](https://www.drupal.org) websites.

## Installation

```shell
npm install --save-dev rollup-plugin-drupal-interface-translations
```

## Usage

```javascript
import { defineConfig,  } from 'vite'
import vitePluginDrupalSdcGenerator from 'vite-plugin-drupal-sdc-generator'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginDrupalSdcGenerator(),
  ],
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/main.js',
    },
  },
})
```

## Options

None yet.
