
const path = require('path');
const { parseOptions } = require('./dist/build');
const dev = require('./dist/dev').default;

const entry = process.argv[1] || process.cwd();
const options = parseOptions('dev', entry, process.argv.slice(2));

dev(options);
