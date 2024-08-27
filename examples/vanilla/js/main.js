import './style.css';

import viteLogo from '/vite.svg';

import { setupCounter } from './counter.js';
import javascriptLogo from './javascript.svg';

// eslint-disable-next-line no-undef
document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="${Drupal.t('Vite logo', null, { context: 'alt text' })}" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="${Drupal.t('JavaScript logo', {}, { context: 'alt text' })}" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

// eslint-disable-next-line no-undef
setupCounter(document.querySelector('#counter'));
