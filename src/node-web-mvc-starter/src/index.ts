import dev from './dev';
import build, { RuntimeOptions } from './build';

const argv = process.argv;
const command = argv[2];
const entry = argv[3];

const prepareOptions = (): RuntimeOptions => {
  const baseOptions: Record<string, any> = {};
  const args: RuntimeOptions['compilerOptions'] = {};
  let key = '';
  let key2 = '';
  process.argv.slice(3).forEach((arg: string) => {
    if (arg.startsWith('--')) {
      key = arg.slice(2);
      key2 = '';
      args[key] = true;
    } if (arg.startsWith('-')) {
      key2 = arg.slice(1);
      key = '';
    } else if (key) {
      args[key] = arg === 'false' ? false : arg === 'true' ? true : arg;
    } else {
      baseOptions[key2] = arg;
    }
  });
  return {
    entry: entry,
    dir: process.cwd(),
    pm2: baseOptions.pm2,
    project: baseOptions.p,
    compilerOptions: args,
  };
};

const options = prepareOptions();

switch (command) {
  case 'dev':
    dev(options);
    break;
  case 'build':
    build(options);
    break;
}
