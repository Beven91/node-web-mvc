
import { register } from 'ts-node';
import path from 'path';
import { createTransformers } from './transformers';

export function tsNode(entry: string) {
  if (!entry) {
    console.log('error: required entry file, example: \'node-web-starter dev index.ts\'');
    process.exit();
  }
  register({
    project: path.resolve(''),
    transpileOnly: false,
    transformers: (program)=>{
      return createTransformers(program);
    },
  });
  require(path.resolve(entry));
}
