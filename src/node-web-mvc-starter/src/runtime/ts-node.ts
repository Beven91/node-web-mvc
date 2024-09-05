
import path from 'path';
import { createTransformers } from '../transformers';
import { resolveTSConfig } from './tsc';
import ts, { } from 'typescript';

export function registerTs(project: string) {
  (global as any).xx = performance.now();
  const installedModules: Map<String, boolean> = new Map();
  const { parsedCommandLine, configPath } = resolveTSConfig(project);
  const compileOptions: ts.CompilerOptions = {
    ...parsedCommandLine.options,
    inlineSourceMap: true,
    noEmit: true,
  };
  const host = ts.createWatchCompilerHost(configPath, compileOptions, ts.sys, undefined, undefined, ()=> {}, undefined, undefined);
  const watcherProgram = ts.createWatchProgram(host);

  function compile(module: NodeJS.Module, id: string) {
    const result = { source: '' };
    const onWriteFile = (fileName: string, text: string) => {
      if (fileName.endsWith('.js')) {
        result.source = text;
      }
    };
    const program = watcherProgram.getProgram().getProgram();
    const transformers = createTransformers(program, false);
    // 开启输出
    program.getCompilerOptions().noEmit = false;
    const sourceFile = program.getSourceFile(id);
    // 进行ts编译
    program.emit(sourceFile, onWriteFile, undefined, undefined, transformers);
    // 标记模块已初始化
    installedModules.set(id, true);
    // 关闭输出
    program.getCompilerOptions().noEmit = true;
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
