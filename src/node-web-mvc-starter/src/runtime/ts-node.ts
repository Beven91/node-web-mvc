
import path from 'path';

export function tsNode(entry: string) {
  require('./register');
  if (!entry) {
    console.log('error: required entry file, example: \'node-web-mvc-starter dev index.ts\'');
    process.exit();
  }
  require(path.resolve(entry));
}
