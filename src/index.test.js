import { describe, expect, test } from '@jest/globals';

import drupalInterfaceTranslations from './index.js';

describe('drupalInterfaceTranslations', () => {
  test('has a name', () => {
    const instance = drupalInterfaceTranslations();
    expect(instance).toHaveProperty('name');
  });
});
