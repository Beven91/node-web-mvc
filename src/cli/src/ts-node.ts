
import path from 'path';
import './register';

export function tsNode(entry: string) {
  if (!entry) {
    console.log('error: required entry file, example: \'node-web-starter dev index.ts\'');
    process.exit();
  }
  require(path.resolve(entry));
}
