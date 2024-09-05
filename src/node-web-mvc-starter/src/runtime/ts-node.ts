
import path from 'path';
import { createTransformers } from '../transformers';
import { resolveTSConfig } from './tsc';
import ts, { } from 'typescript';

export function registerTs(project: string) {
  (global as any).NODE_MVC_STARTER_TIME = performance.now();
  const installedModules = new Map();
  const { parsedCommandLine, configPath } = resolveTSConfig(project, undefined, false);
  const compileOptions: ts.CompilerOptions = {
    ...parsedCommandLine.options,
    inlineSourceMap: true,
  };
  let program = ts.createProgram(parsedCommandLine.fileNames, compileOptions);

  function compile(module: NodeJS.Module, id: string) {
    const result = { source: '' };
    const onWriteFile = (fileName: string, text: string) => {
      if (fileName.endsWith('.js')) {
        result.source = text;
      }
    };
    if (installedModules.has(id)) {
      // 在热更新时，这里需要更新掉当前sourceFile
      const oldProgram = program;
      program = ts.createProgram(parsedCommandLine.fileNames, compileOptions, {
        ...ts.createCompilerHost(compileOptions),
        getSourceFile(name, v) {
          if (name == id) {
            return ts.createSourceFile(name, ts.sys.readFile(name), v);
          }
          return oldProgram.getSourceFile(name);
        },
      }, program);
    }
    // 进行ts编译
    const transformers = createTransformers(program, false);
    const sourceFile = program.getSourceFile(id);
    program.emit(sourceFile, onWriteFile, undefined, undefined, transformers);
    installedModules.set(id, true);
    // 运行模块代码
    return (module as any)._compile(result.source, id);
  }

  // 注册ts扩展模块
  require.extensions['.ts'] = function(module, filename: string) {
    compile(module, filename);
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
