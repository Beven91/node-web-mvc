import { tsNode } from './ts-node';
import { tsc } from './tsc';

const argv = process.argv;

const command = argv[2];
const entry = argv[3];

switch (command) {
  case 'dev':
    tsNode(entry);
    break;
  case 'build':
    tsc();
    break;
}
