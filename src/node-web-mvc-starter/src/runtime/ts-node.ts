
import path from 'path';
import fs from 'fs';
import CachableIncrementalProgram from './CachableIncrementalProgram';

interface MyGlobal extends NodeJS.Global {
  NODE_MVC_STARTER_TIME?: number
}

export function registerTs(project: string) {
  const myGlobal = global as MyGlobal;
  myGlobal.NODE_MVC_STARTER_TIME = performance.now();
  const program = new CachableIncrementalProgram(project);
  const emitResult = program.emit();

  // 注册ts扩展模块
  require.extensions['.ts'] = function(module, filename: string) {
    if (program.isInitialized) {
      program.emitHotUpdate(filename);
    }
    const id = program.getOutFileName(filename);
    const source = fs.readFileSync(id).toString('utf-8');
    (module as any)._compile(source, filename);
    if (!program.isInitialized) {
      program.tryOnInitEmitFinished(emitResult);
    }
  };
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
