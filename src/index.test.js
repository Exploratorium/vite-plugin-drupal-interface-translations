import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test } from '@jest/globals';
import { rollup } from 'rollup';

import drupalInterfaceTranslations from './index.js';

describe('drupalInterfaceTranslations', () => {
  test('has a name', () => {
    const instance = drupalInterfaceTranslations();
    expect(instance).toHaveProperty('name');
  });
});

describe('generate', () => {
  const output = join(tmpdir(), 'test.pot');
  const outputOptions = { dir: tmpdir() };
  const testResourcesDir = 'test_resources';

  const runTest = async (inputFile, expectedMatches) => {
    const inputOptions = {
      input: inputFile,
      plugins: [drupalInterfaceTranslations({ output })],
    };
    const bundle = await rollup(inputOptions);
    await bundle.generate(outputOptions);
    const content = (await readFile(output)).toString();
    expectedMatches.forEach((match) => expect(content).toMatch(match));
  };

  test('Drupal.t - basic', async () => {
    await runTest(`${testResourcesDir}/drupal-t.js`, [
      /#: test_resources\/drupal-t.js:1:1/,
      /msgid "hello world"/,
      /msgstr ""/,
    ]);
  });

  test('Drupal.t - with context', async () => {
    await runTest(`${testResourcesDir}/drupal-t.js`, [
      /#: test_resources\/drupal-t.js:1:1/,
      /msgctxt "greetings"/,
      /msgid "hello world"/,
      /msgstr ""/,
    ]);
  });

  test('Drupal.formatPlural - basic', async () => {
    await runTest(`${testResourcesDir}/drupal-formatPlural.js`, [
      /#: test_resources\/drupal-formatPlural.js:1:1/,
      /msgid "an answer"/,
      /msgid_plural "@count answers"/,
      /msgstr\[0] ""/,
      /msgstr\[1] ""/,
    ]);
  });

  test('Drupal.formatPlural - context', async () => {
    await runTest(`${testResourcesDir}/drupal-formatPlural.js`, [
      /#: test_resources\/drupal-formatPlural.js:1:1/,
      /msgctxt "everything"/,
      /msgid "an answer"/,
      /msgid_plural "@count answers"/,
      /msgstr\[0] ""/,
      /msgstr\[1] ""/,
    ]);
  });
});
