import { relative } from 'node:path';

const TRANSLATION_FUNCTIONS_REG_EXP = (function () {
  const translationFunctions = ['Drupal.t', 'Drupal.formatPlural']
    .map((keypath) =>
      keypath.replace(/\*/g, '\\w+').replace(/\./g, '\\s*\\.\\s*'),
    )
    .map((keypath) => '(?:\\b\\w+\\.|)' + keypath);
  return new RegExp(`^(?:${translationFunctions.join('|')})$`);
})();

function getName(node) {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'ThisExpression') {
    return 'this';
  }
  if (node.type === 'Super') {
    return 'super';
  }

  return null;
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

function flatten(node) {
  const parts = [];

  while (node.type === 'MemberExpression') {
    if (node.computed) {
      return null;
    }

    parts.unshift(node.property.name);
    node = node.object;
  }

  const name = getName(node);

  if (!name) {
    return null;
  }

  parts.unshift(name);
  return parts.join('.');
}

function generateKey(msgId, msgIdPlural, msgCtxt) {
  const messageIdPart = JSON.stringify({ msgId, msgIdPlural });
  const messageContextPart = msgCtxt ? JSON.stringify(msgCtxt) : '';
  return `msgid<${messageIdPart}>;msgctxt<${messageContextPart}>`;
}

export default class MessagesBuilder {
  constructor(cwd) {
    this.msgs = {};
    this.cwd = cwd;
  }

  build() {
    return Object.values(this.msgs);
  }

  static isDrupalTranslationFunction(node) {
    if (node.type !== 'CallExpression') {
      return false;
    }

    const keypath = flatten(node.callee);
    return keypath && TRANSLATION_FUNCTIONS_REG_EXP.test(keypath);
  }

  extractTranslationCall(id, node, code) {
    const keypath = flatten(node.callee);
    if (keypath === 'Drupal.formatPlural') {
      this.#extractFormatPlural(id, node, code);
    } else {
      this.#extractT(id, node, code);
    }
  }

  // private
  #extractT(id, expression, code) {
    const msgId = expression.arguments[0]?.value;
    const msgCtxt = expression.arguments[2]?.properties[0]?.value?.value;
    const msg = this.#getOrCreate(msgId, null, msgCtxt);
    addLoc(msg, expression, code);

    this.#assignReferences(id, msg);

    return msg;
  }

  #extractFormatPlural(id, expression, code) {
    const msgId = expression.arguments[1]?.value;
    const msgIdPlural = expression.arguments[2]?.value;
    const msgCtxt = expression.arguments[4]?.properties[0]?.value?.value;
    const msg = this.#getOrCreate(msgId, msgCtxt, msgIdPlural);
    addLoc(msg, expression, code);

    this.#assignReferences(id, msg);

    return msg;
  }

  #getOrCreate(msgId, msgCtxt, msgIdPlural = undefined) {
    const key = generateKey(msgId, msgIdPlural, msgCtxt);
    if (!Object.hasOwn(this.msgs, key)) {
      this.msgs[key] = {
        msgId,
        msgCtxt,
        msgIdPlural,
        references: [],
      };
    }
    return this.msgs[key];
  }

  #assignReferences(id, msg) {
    Object.values(msg.references).forEach((ref) => {
      ref.path = id;
      ref.relativePath = relative(this.cwd, id);
    });
  }
}
