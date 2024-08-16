import { describe, expect } from '@jest/globals';

import MessagesBuilder from './messagesBuilder';

const makeFakeNode = (name, type = 'CallExpression') => ({
  type,
  callee: {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: ['Drupal'],
    },
    property: {
      name: [name],
    },
  },
});

describe('MessagesBuilder Class - isDrupalTranslationFunction method', () => {
  ['t', 'formatPlural'].forEach((name) => {
    it(`returns true if the callee is "Drupal.${name}"`, () => {
      const node = makeFakeNode(name);

      expect(MessagesBuilder.isDrupalTranslationFunction(node)).toBe(true);
    });
  });

  ['T', 'at', 'to', 'FORMATPLURAL', 'formatPlurals'].forEach((name) => {
    it(`returns false if the callee is "Drupal.${name}"`, () => {
      const node = makeFakeNode(name);

      expect(MessagesBuilder.isDrupalTranslationFunction(node)).toBe(false);
    });
  });

  it('returns false if it is not a "CallExpression"', () => {
    const node = makeFakeNode('t', 'Fake');

    expect(MessagesBuilder.isDrupalTranslationFunction(node)).toBe(false);
  });
});
