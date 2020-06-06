const path = require('path');

require('@babel/register')({
  'extensions': ['.ts', '.js', '.mjs'],
  'ignore': [
    (filepath) => /node_modules/.test(filepath),
  ],
  'presets': [
    'module:metro-react-native-babel-preset',
  ],
  'plugins': [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
  ],
  'sourceMaps': true,
  'retainLines': true,
});


require('./www.ts');
