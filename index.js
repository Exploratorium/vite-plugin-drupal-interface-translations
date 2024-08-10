import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, relative } from 'node:path';

import { createFilter } from '@rollup/pluginutils';
import { walk } from 'estree-walker';
import { SourceMapConsumer } from 'source-map';

// eslint-disable-next-line no-undef
const cwd = process.cwd();
const module = basename(cwd);

function getName(node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'ThisExpression') return 'this';
  if (node.type === 'Super') return 'super';

  return null;
}

function flatten(node) {
  const parts = [];

  while (node.type === 'MemberExpression') {
    if (node.computed) return null;

    parts.unshift(node.property.name);
    node = node.object;
  }

  const name = getName(node);

  if (!name) return null;

  parts.unshift(name);
  return parts.join('.');
}

function generateKey(msgId, msgIdPlural, msgCtxt) {
  const messageIdPart = JSON.stringify({ msgId, msgIdPlural });
  const messageContextPart = msgCtxt ? JSON.stringify(msgCtxt) : '';
  return `msgid<${messageIdPart}>;msgctxt<${messageContextPart}>`;
}

function getGetTextTemplate({ msgId, msgIdPlural, msgCtxt, references }) {
  const template = [];
  if (Object.keys(references).length > 0) {
    const iteratee = ({ relativePath, line, column }) =>
      `${relativePath}:${line}:${column + 1}`;
    const allReferences = Object.values(references).map(iteratee).join(' ');
    template.push(`#: ${allReferences}`);
  }
  if (msgCtxt) {
    template.push(`msgctxt ${JSON.stringify(msgCtxt)}`);
  }
  template.push(`msgid ${JSON.stringify(msgId)}`);
  if (msgIdPlural) {
    template.push(`msgid_plural ${JSON.stringify(msgIdPlural)}`);
    template.push('msgstr[0] ""');
    template.push('msgstr[1] ""');
  } else {
    template.push('msgstr ""');
  }

  return template.join('\n');
}

function potFileOutput(content) {
  const contentString = content.join('\n\n');

  return contentString + '\n';
}

function addLoc(msg, expression, code) {
  const lines = code.substring(0, expression.start);
  const splitLines = lines.split('\n');
  const line = splitLines.length;
  const lastLine = splitLines[line - 1];
  const column = lastLine.length;

  const loc = {
    start: {
      ...expression.start,
      line,
      column,
    },
    end: expression.end,
  };

  const reference = {
    loc,
  };
  msg.references.push(reference);
}

export const vitePluginDrupalInterfaceTranslations = (
  { include, exclude, functions, output } = {
    functions: ['Drupal.t', 'Drupal.formatPlural'],
    output: `translations/${module}.pot`,
    path: 'translations',
  },
) => {
  const filter = createFilter(include, exclude, { resolve: true });

  const msgs = {};
  const sources = {};

  function getOrCreate(msgId, msgCtxt, msgIdPlural = undefined) {
    const key = generateKey(msgId, msgIdPlural, msgCtxt);
    if (!Object.hasOwn(msgs, key)) {
      msgs[key] = {
        msgId,
        msgCtxt,
        msgIdPlural,
        references: [],
      };
    }
    return msgs[key];
  }
  function extractFormatString(expression, code) {
    const msgId = expression.arguments[0]?.value;
    const msgCtxt = expression.arguments[2]?.properties[0]?.value?.value;
    const msg = getOrCreate(msgId, null, msgCtxt);
    addLoc(msg, expression, code);

    return msg;
  }

  function extractFormatPlural(expression, code) {
    const msgId = expression.arguments[1]?.value;
    const msgIdPlural = expression.arguments[2]?.value;
    const msgCtxt = expression.arguments[4]?.properties[0]?.value?.value;
    const msg = getOrCreate(msgId, msgCtxt, msgIdPlural);
    addLoc(msg, expression, code);

    return msg;
  }

  const translationFunctions = functions
    .map((keypath) =>
      keypath.replace(/\*/g, '\\w+').replace(/\./g, '\\s*\\.\\s*'),
    )
    .map((keypath) => '(?:\\b\\w+\\.|)' + keypath);
  const reFunctions = new RegExp(`^(?:${translationFunctions.join('|')})$`);
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
          if (node.type === 'CallExpression') {
            const keypath = flatten(node.callee);
            if (keypath && reFunctions.test(keypath)) {
              let msg;
              if (keypath === 'Drupal.formatPlural') {
                msg = extractFormatPlural(node, code);
              } else {
                msg = extractFormatString(node, code);
              }
              Object.values(msg.references).forEach((ref) => {
                ref.path = id;
                ref.relativePath = relative(cwd, id);
              });

              this.skip();
            }
          }
        },
      });

      return UNCHANGED;
    },
    async generateBundle() {
      const msgValues = Object.values(msgs);
      const promises = msgValues.map(async (msg) => {
        const promises = Object.values(msg.references).map(async (ref) => {
          const source = sources[ref.path];

          const start = ref.loc.start;

          const pos = await SourceMapConsumer.with(source, null, (consumer) => {
            return consumer.originalPositionFor(start);
          });

          ref.line = pos.line || ref.line;
          ref.column = pos.column || ref.column;
        });
        return Promise.all(promises);
      });

      await Promise.all(promises);

      const msgsAsString = msgValues.map(getGetTextTemplate);
      const potContent = potFileOutput(msgsAsString);

      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, potContent);
    },
  };
};

export default vitePluginDrupalInterfaceTranslations;
