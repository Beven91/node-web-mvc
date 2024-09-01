
const path = require('path');
const { parseOptions } = require('./dist/build');
const dev = require('./dist/dev').default;

const entry = process.argv.find((m)=>{
  const ext = path.extname(m);
  return ext == '.ts' || ext == '.tsx';
}) || process.cwd();
const options = parseOptions('dev', entry, process.argv.slice(2));

dev(options);
