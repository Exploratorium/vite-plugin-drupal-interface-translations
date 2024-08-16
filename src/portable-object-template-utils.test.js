import { describe, expect, test } from '@jest/globals';

import { generatePotFile } from './portable-object-template-utils.js';

describe('portable object template (POT) file utils', () => {
  const reference = { relativePath: 'test.js', line: 42, column: 4 };

  const testHasFileReference = (text) =>
    test('Starts with a file reference.', () => {
      expect(text).toMatch(/^#: test.js:42:5/);
    });

  const testHasContext = (text) =>
    test('Starts with a file reference.', () => {
      expect(text).toMatch(/\nmsgctxt "Greeting"\n/);
    });

  describe('translate message', () => {
    const msgValues = [
      {
        msgId: 'Hello world.',
        msgIdPlural: null,
        msgCtxt: 'Greeting',
        references: {
          '': reference,
        },
      },
    ];

    const content = generatePotFile(msgValues);

    testHasFileReference(content);
    testHasContext(content);
    test("has a 'msgid' line", () => {
      expect(content).toMatch(/\nmsgid "Hello world."\n/);
    });
    test("doesn't have a 'msgid_plural' line", () => {
      expect(content).not.toMatch(/\nmsgid_plural/);
    });
  });

  describe('translate plural message', () => {
    const msgValues = [
      {
        msgId: 'Hello you.',
        msgIdPlural: "Hello y'all.",
        msgCtxt: 'Greeting',
        references: {
          '': reference,
        },
      },
    ];

    const content = generatePotFile(msgValues);

    testHasFileReference(content);
    testHasContext(content);
    test("has a 'msgid' line", () => {
      expect(content).toMatch(/\nmsgid "Hello you."\n/);
    });
    test("has a 'msgid_plural' line", () => {
      expect(content).toMatch(/\nmsgid_plural "Hello y'all."\n/);
    });
  });
});
