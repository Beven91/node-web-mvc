
import path from 'path';
import { register } from 'ts-node';
import { createTransformers } from '../transformers';
import ts from 'typescript';

export function registerTs(project: string) {
   // 查找 `tsconfig.json` 的路径
   const configPath = ts.findConfigFile(project, ts.sys.fileExists, 'tsconfig.json');
  register({
    project: configPath,
    transpileOnly: false,
    transformers: (program) => {
      return createTransformers(program, false);
    },
  });
}

export function tsNode(entry: string) {
  const id = path.resolve(entry);
  registerTs(path.dirname(id));
  if (!entry) {
    console.log('error: required entry file, example: \'node-web-mvc-starter dev index.ts\'');
    process.exit();
  }
  require(id);
}
