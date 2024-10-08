module.exports = {
  'parser': '@typescript-eslint/parser',
  'plugins': [ '@typescript-eslint' ],
  'extends': [
    'plugin:@typescript-eslint/recommended',
    'google',
  ],
  'env': {
    browser: true,
    node: true,
    es6: true,
    commonjs: true,
  },
  'rules': {
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-types': 0,
    'new-cap': 0,
    'no-console': 0,
    'require-jsdoc': 0,
    'no-debugger': 0,
    'array-bracket-spacing': [ 'error', 'always' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'import/no-extraneous-dependencies': 0,
    'semi': [ 'error', 'always' ],
    'no-cond-assign': [ 'error', 'always' ],
    'no-console': 'off',
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'no-param-reassign': 0,
    'max-len': 0,
    'global-require': 0,
    'no-plusplus': 0,
    'generator-star-spacing': 0,
    'no-confusing-arrow': 0,
    'arrow-parens': 0,
    'no-invalid-this': 0,
    'no-case-declarations': 0,
    'import/extensions': 0,
    'valid-jsdoc': 0,
    'no-unused-vars': 'off',
    'semi': 0,
    '@typescript-eslint/semi': [ 'error', 'always' ],
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-this-alias': 0,
    'space-before-function-paren': [ 'error', 'never' ],
  },
  'globals': {
  },
};
