
const path = require('path');
const { registerTs } = require('./dist/runtime/ts-node');

registerTs(path.resolve(''));
