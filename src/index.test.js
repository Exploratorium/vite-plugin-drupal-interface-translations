import drupalInterfaceTranslations from './index.js';

describe('drupalInterfaceTranslations', () => {
  test('has a name', () => {
    const instance = drupalInterfaceTranslations();
    expect(instance).toHaveProperty('name');
  });
});
