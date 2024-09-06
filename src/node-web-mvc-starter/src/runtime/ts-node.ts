
import path from 'path';
import fs from 'fs';
import { createTransformers } from '../transformers';
import { resolveTSConfig } from './tsc';
import ts, { } from 'typescript';

const cacheDir = path.resolve('node_modules/.ncache/');

function printEmitDiagnostics(program: ts.Program, emitResult: ts.EmitResult, formatHost: ts.CompilerHost, sourceFile?: ts.SourceFile) {
  const allDiagnostics = ts.getPreEmitDiagnostics(program, sourceFile).concat(emitResult.diagnostics);
  if (allDiagnostics?.length > 0) {
    const out = ts.formatDiagnosticsWithColorAndContext(allDiagnostics, formatHost);
    allDiagnostics.length = 0;
    console.log(out);
  }
}

export function registerTs(project: string) {
  (global as any).NODE_MVC_STARTER_TIME = performance.now();
  const installedModules = new Map();
  const selfOptions: ts.CompilerOptions = {
    inlineSourceMap: true,
    incremental: true,
    tsBuildInfoFile: path.join(cacheDir, './tsBuildInfo.json'),
    outDir: path.join(cacheDir, 'dist'),
  };
  const { parsedCommandLine } = resolveTSConfig(project, selfOptions, false);
  const host = ts.createIncrementalCompilerHost(parsedCommandLine.options);
  let program = ts.createIncrementalProgram({
    rootNames: parsedCommandLine.fileNames,
    options: parsedCommandLine.options,
    host,
  });
  const formatHost = ts.createCompilerHost(program.getCompilerOptions());
  const compileOptions = program.getCompilerOptions();

  const emitResult = program.emit(undefined, undefined, undefined, undefined, createTransformers(program.getProgram(), false));

  // printEmitDiagnostics(program.getProgram(), emitResult, formatHost);


  // 注册ts扩展模块
  require.extensions['.ts'] = function(module, filename: string) {
    if (installedModules.get(filename)) {
      const oldProgram = program;
      // 如果是热更新
      program = ts.createIncrementalProgram({
        rootNames: parsedCommandLine.fileNames,
        options: compileOptions,
        host: {
          ...host,
          getSourceFile(name, v) {
            if (name == filename) {
              return host.getSourceFile(name, v);
            }
            return oldProgram.getSourceFile(name) || host.getSourceFile(name, v);
          },
        },
      });
      const emitResult = program.emit(undefined, undefined, undefined, undefined, createTransformers(program.getProgram(), false));
      printEmitDiagnostics(program.getProgram(), emitResult, formatHost, program.getSourceFile(filename));
    }
    const name = path.relative(parsedCommandLine.options.rootDir, filename);
    const id = path.join(parsedCommandLine.options.outDir, name.replace('.ts', '.js'));
    const source = fs.readFileSync(id).toString('utf-8');
    (module as any)._compile(source, filename);
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
