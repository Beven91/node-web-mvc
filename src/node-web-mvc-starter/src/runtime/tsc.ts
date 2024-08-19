import ts from 'typescript';
import path from 'path';
import { createTransformers } from '../transformers';

export interface ConfigOptions {
  compilerOptions: ts.CompilerOptions
  extends: string,
  exclude: string[],
  compileOnSave: boolean
}

export function tsc(extendOptions: ConfigOptions['compilerOptions'], project = './') {
  // 查找 `tsconfig.json` 的路径
  const configPath = ts.findConfigFile(project, ts.sys.fileExists, 'tsconfig.json');

  if (!configPath) {
    throw new Error('Could not find a valid \'tsconfig.json\'.');
  }

  // 读取 `tsconfig.json`
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    const errorMessage = ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n');
    throw new Error(errorMessage);
  }

  configFile.config = {
    ...configFile.config,
    compilerOptions: {
      ...configFile.config.compilerOptions,
      ...extendOptions,
    },
  };

  // 解析 `tsconfig.json` 的内容
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );

  if (parsedCommandLine.errors?.length > 0) {
    console.error(parsedCommandLine.errors.map((m) => m.messageText).join('\n'));
    process.exit(1);
  }

  // console.log(parsedCommandLine.options);

  // 创建程序对象
  const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);

  // 获取并报告诊断信息
  const diagnostics = ts.getPreEmitDiagnostics(program);

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  // 发出(生成)编译后的文件
  const emitResult = program.emit(undefined, undefined, undefined, undefined, createTransformers(program));

  // 处理发出的文件和报告发出后的诊断信息
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  // 处理完成后的操作
  return {
    emitResult,
    rootDir: path.join(path.dirname(configPath), configFile.config.compilerOptions.rootDir),
    outDir: path.join(path.dirname(configPath), configFile.config.compilerOptions.outDir),
    config: configFile.config as ConfigOptions,
  };
}
