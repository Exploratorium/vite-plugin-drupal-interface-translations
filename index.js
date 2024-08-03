import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

import { walk } from 'estree-walker';
import _ from 'lodash';
import { SourceMapConsumer } from 'source-map';
import { createFilter } from 'vite';

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
  const messageContextPart = !_.isNil(msgCtxt) ? JSON.stringify(msgCtxt) : '';
  return `msgid<${messageIdPart}>;msgctxt<${messageContextPart}>`;
}

function getGetTextTemplate({ msgId, msgIdPlural, msgCtxt, references }) {
  const template = [];
  if (!_.isEmpty(references)) {
    const iteratee = ({ relativePath, line, column }) =>
      `${relativePath}:${line}:${column + 1}`;
    const allReferences = _.join(_.map(references, iteratee), ' ');
    template.push(`#: ${allReferences}`);
  }
  if (!_.isNil(msgCtxt)) {
    template.push(`msgctxt ${JSON.stringify(msgCtxt)}`);
  }
  template.push(`msgid ${JSON.stringify(msgId)}`);
  if (!_.isNil(msgIdPlural)) {
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

  const loc = _.pick(expression, 'start', 'end');
  _.set(loc, 'start.line', line);
  _.set(loc, 'start.column', column);

  const reference = {
    loc,
  };
  msg.references.push(reference);
}

const rollupPluginDrupalInterfaceTranslations = (options = {}) => {
  // eslint-disable-next-line no-undef
  const cwd = process.cwd();

  const output = _.get(options, 'output', `${basename(cwd)}.pot`);
  const include = _.get(options, 'include', cwd + '/**/*.{jsx,js}');
  const { exclude } = options;

  const filter = createFilter(include, exclude);

  const msgs = {};
  const sources = {};

  function getOrCreate(msgId, msgCtxt, msgIdPlural = undefined) {
    const key = generateKey(msgId, msgIdPlural, msgCtxt);
    if (!_.has(msgs, key)) {
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
    const msgId = _.get(expression, 'arguments.0.value');
    const msgCtxt = _.get(expression, 'arguments.2.properties.0.value.value');
    const msg = getOrCreate(msgId, null, msgCtxt);
    addLoc(msg, expression, code);

    return msg;
  }

  function extractFormatPlural(expression, code) {
    const msgId = _.get(expression, 'arguments.1.value');
    const msgIdPlural = _.get(expression, 'arguments.2.value');
    const msgCtxt = _.get(expression, 'arguments.4.properties.0.value.value');
    const msg = getOrCreate(msgId, msgCtxt, msgIdPlural);
    addLoc(msg, expression, code);

    return msg;
  }

  const functions = (options.functions || ['Drupal.t', 'Drupal.formatPlural'])
    .map((keypath) =>
      keypath.replace(/\*/g, '\\w+').replace(/\./g, '\\s*\\.\\s*'),
    )
    .map((keypath) => '(?:\\b\\w+\\.|)' + keypath);
  const reFunctions = new RegExp(`^(?:${functions.join('|')})$`);
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
              _.each(msg.references, (ref) => {
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
      const promises = _.map(msgs, async (msg) => {
        const promises = _.map(msg.references, async (ref) => {
          const source = sources[ref.path];

          const start = ref.loc.start;

          const pos = await SourceMapConsumer.with(source, null, (consumer) => {
            return consumer.originalPositionFor(start);
          });

          _.merge(ref, _.pick(pos, 'line', 'column'));
        });
        return Promise.all(promises);
      });

      await Promise.all(promises);

      const msgsAsString = _.map(msgs, getGetTextTemplate);
      const potContent = potFileOutput(msgsAsString);

      mkdirSync(join(cwd, 'translations'), { recursive: true });
      writeFileSync(join(cwd, 'translations', output), potContent);
    },
  };
};

export default rollupPluginDrupalInterfaceTranslations;
