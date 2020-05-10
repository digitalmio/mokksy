module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'jest'],
  env: {
    node: true,
    jest: true,
  },
  extends: ['airbnb-typescript', 'prettier/@typescript-eslint'],
  rules: {
    'no-console': 0,
    'comma-dangle': 0, // prettier does not like it
    'implicit-arrow-linebreak': 0, // same here, prettier doesn't care about this one
    'function-paren-newline': 0, // same here...
    'import/prefer-default-export': 0,
    'consistent-return': 0,
    'object-curly-newline': [2, { ImportDeclaration: 'never', ExportDeclaration: 'never' }],
    'no-param-reassign': [2, { props: false }],
  },
};
