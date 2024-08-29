import dev from './dev';
import build, { parseOptions } from './build';

const argv = process.argv;
const command = argv[2];
const entry = argv[3];

const options = parseOptions(command, entry, process.argv.slice(3));

switch (options.command) {
  case 'dev':
    dev(options);
    break;
  case 'build':
    build(options);
    break;
}
