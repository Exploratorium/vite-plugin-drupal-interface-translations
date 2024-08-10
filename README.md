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

None yet.

## About Us

Located in San Francisco, California, the Exploratorium is a public learning laboratory exploring the world through science, art, and human perception.

### Mission, Vision, and Values

Our mission is to create inquiry-based experiences that transform learning worldwide.
Our vision is a world where people think for themselves and can confidently ask questions, question answers, and understand the world around them.
We value lifelong learning, curiosity, and inclusion.

We create tools and experiences that help you to become an active explorer:
hundreds of explore-for-yourself exhibits, a website with over 35,000 pages of content, film screenings, evening art and science events for adults, plus much more.
We also create professional development programs for educators, and are at the forefront of changing the way science is taught.
We share our exhibits and expertise with museums worldwide.

---

The Exploratorium is a 501(c)(3) nonprofit organization. Our tax ID #: 94-1696494

https://www.exploratorium.edu
