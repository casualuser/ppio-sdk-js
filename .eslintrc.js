const fs = require('fs')

const prettierOptions = JSON.parse(fs.readFileSync('./.prettierrc', 'utf8'))

module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
    parser: 'babel-eslint',
    sourceType: 'module',
    allowImportExportEverywhere: true,
  },
  extends: ['standard', 'prettier'],
  plugins: ['import', 'promise', 'prettier'],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': ['error', prettierOptions],
    'arrow-body-style': ['warn', 'as-needed'],
    'arrow-parens': ['off'],
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'generator-star-spacing': 'off',
    'import/newline-after-import': 'warn',
    'import/no-dynamic-require': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'no-multi-assign': 'off',
    'promise/param-names': 'error',
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
    'prefer-template': 'error',
    camelcase: 'off',
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
  },
}
