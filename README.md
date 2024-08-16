# Rollup Plugin for Drupal to Extract Interface Translations

This is a [Rollup](https://rollupjs.org) plugin that helps you to
[translation strings in JavaScript](https://www.drupal.org/docs/8/api/translation-api/overview#s-translation-in-javascript-files)
that are used in [Drupal](https://www.drupal.org) websites.

Based on [DrupalTranslationsWebpackPlugin](https://github.com/dulnan/drupal-translations-webpack-plugin).

## Installation

```shell
npm install --save-dev rollup-plugin-drupal-interface-translations
```

## Usage

```javascript
import drupalInterfaceTranslations from 'rollup-plugin-drupal-interface-translations';

// https://rollupjs.org/configuration-options/
export default {
  input: 'main.js',
  plugins: [drupalInterfaceTranslations()],
};
```

This plugin can be used with [Vite](https://vitejs.dev).

```javascript
import { defineConfig } from 'vite';
import drupalInterfaceTranslations from 'rollup-plugin-drupal-interface-translations';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: 'main.js',
      plugins: [drupalInterfaceTranslations()],
    },
  },
});
```

## Options

### filterOptions

Defines the files that are included in and excluded from interface translation extraction.

There are the parameters for the [createFilter](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter)
function in [@rollup/pluginutils](https://github.com/rollup/plugins/tree/master/packages/pluginutils).

### output

Type
: `string`

Default
: `"translations/{MODULE_NAME}.pot"`

The file path relative of the .pot (portable object template) file
that this plugin will generate.

---

The Exploratorium is a 501(c)(3) nonprofit organization. Our tax ID #: 94-1696494

https://www.exploratorium.edu
