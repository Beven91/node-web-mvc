
import path from 'path';
import fs from 'fs';
import TsCompiler from './TsCompiler';
import { MyGlobal } from 'shared-types';

export function registerTs(project: string) {
  const myGlobal = global as MyGlobal;
  myGlobal.NODE_MVC_STARTER_TIME = performance.now();
  const program = new TsCompiler(project);
  program.init();

  // 注册ts扩展模块
  require.extensions['.ts'] = function(module, filename: string) {
    const id = program.compile(filename);
    const source = fs.readFileSync(id).toString('utf-8');
    (module as any)._compile(source, filename);
  };

  return program;
}

export function tsNode(entry: string) {
  const id = path.resolve(entry);
  const program = registerTs(path.dirname(id));
  if (!entry) {
    console.log('error: required entry file, example: \'node-web-mvc-starter dev index.ts\'');
    process.exit();
  }
  if (fs.lstatSync(entry).isFile()) {
    require(id);
  }
  program.afterInitCompile();
}
