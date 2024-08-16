import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

import { createFilter } from '@rollup/pluginutils';
import { walk } from 'estree-walker';
import { SourceMapConsumer } from 'source-map';

import MessagesBuilder from './messagesBuilder.js';
import { generatePotFile } from './portable-object-template-utils.js';

// eslint-disable-next-line no-undef
const CURRENT_WORKING_DIRECTORY = process.cwd();
const MODULE_NAME = basename(CURRENT_WORKING_DIRECTORY);

const drupalInterfaceTranslations = (
  { filterOptions, output } = {
    filterOptions: {
      include: undefined,
      exclude: undefined,
      options: undefined,
    },
    output: `translations/${MODULE_NAME}.pot`,
  },
) => {
  const filter = createFilter(
    filterOptions?.include,
    filterOptions?.exclude,
    filterOptions?.options,
  );

  const msgs = new MessagesBuilder(CURRENT_WORKING_DIRECTORY);
  const sources = {};

  const UNCHANGED = null;

  return {
    name: 'rollup-plugin-drupal-interface-translations',
    enforce: 'post',
    transform(code, id) {
      if (!filter(id)) return UNCHANGED;

      let ast;

      try {
        ast = this.parse(code);
      } catch (err) {
        err.message += ` in ${id}`;
        throw err;
      }

      sources[id] = this.getCombinedSourcemap();

      walk(ast, {
        enter(node) {
          if (MessagesBuilder.isDrupalTranslationFunction(node)) {
            msgs.extractTranslationCall(id, node, code);
            this.skip();
          }
        },
      });

      return UNCHANGED;
    },
    async generateBundle() {
      const msgValues = msgs.build();
      const msgPromises = msgValues.map(async (msg) => {
        const refPromises = Object.values(msg.references).map(async (ref) => {
          const source = sources[ref.path];

          const start = ref.loc.start;

          const pos = await SourceMapConsumer.with(source, null, (consumer) => {
            return consumer.originalPositionFor(start);
          });

          ref.line = pos.line || ref.line;
          ref.column = pos.column || ref.column;
        });
        return Promise.all(refPromises);
      });

      await Promise.all(msgPromises);

      const potContent = generatePotFile(msgValues);

      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, potContent);
    },
  };
};

export default drupalInterfaceTranslations;
