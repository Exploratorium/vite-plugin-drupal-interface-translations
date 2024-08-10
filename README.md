# Vite Plugin for Drupal to Extract Interface Translations

This is a [vite](https://vitejs.dev) plugin that helps you to
[translation strings in JavaScript](https://www.drupal.org/docs/8/api/translation-api/overview#s-translation-in-javascript-files)
that are used in [Drupal](https://www.drupal.org) websites.

## Installation

```shell
npm install --save-dev vite-plugin-drupal-interface-translations
```

## Usage

```javascript
import { defineConfig } from 'vite';
import vitePluginDrupalInterfaceTranslations from 'vite-plugin-drupal-interface-translations';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vitePluginDrupalInterfaceTranslations()],
  root: 'js',
  build: {
    rollupOptions: {
      input: 'js/main.js',
    },
  },
});
```

## Options

### output

Type
: `string`

Default
: `"translations.pot"`

The ...

---

The Exploratorium is a 501(c)(3) nonprofit organization. Our tax ID #: 94-1696494

https://www.exploratorium.edu
