module.exports = {
  root: true,
  env: { es2020: true },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  globals: {
    Drupal: true,
  },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'unused-imports/no-unused-imports': 'error',
  },
};
