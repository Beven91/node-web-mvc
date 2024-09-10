import ts, { CompilerOptions } from 'typescript';
import path, { } from 'path';
import fs from 'fs';
import { createTransformers } from '../transformers';
import Colors from './color';

export interface ConfigOptions {
  compilerOptions: ts.CompilerOptions
  extends: string,
  exclude: string[],
  compileOnSave: boolean
}

function removeDist(dest: string) {
  if (!fs.existsSync(dest)) {
    return;
  }
  const files = fs.readdirSync(dest);
  files.forEach((f) => {
    const id = path.join(dest, f);
    if (fs.lstatSync(id).isDirectory()) {
      removeDist(id);
      return;
    }
    fs.unlinkSync(id);
  });
  fs.rmdirSync(dest);
}

export function logging(message: string) {
  console.log(`${message}`);
}

export function logError(errorCode: number, errorMessage: string, file: string, line: number, character: number) {
  const fileName = Colors.lightBlue(file);
  const code = Colors.gray(`TS${errorCode}:`);
  const type = Colors.red('error');
  const row = line >= 0 ? Colors.yellow((line + 1).toString()) : '';
  const col = character >= 0 ? Colors.yellow((character + 1).toString()) : '';
  console.error(`${fileName}:${row}:${col} - ${type} ${code} ${errorMessage}`);
}

function joinDir(base: string, name: string) {
  return path.isAbsolute(name) ? name : path.join(base, name);
}

export function resolveTSConfig(project: string, extendOptions?: ConfigOptions['compilerOptions'], log = true, dev = false) {
  // 查找 `tsconfig.json` 的路径
  const configPath = ts.findConfigFile(project || './', ts.sys.fileExists, 'tsconfig.json');

  if (!configPath) {
    throw new Error('Could not find a valid \'tsconfig.json\'.');
  }

  if (log) {
    console.log(`Finded tsconfig: ${configPath}`);
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
      // 以下两项属性必须开启,运行时支持需要
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  };

  const compilerOptions = configFile.config.compilerOptions as CompilerOptions;

  compilerOptions.rootDir = compilerOptions.rootDir || '';
  compilerOptions.outDir = compilerOptions.outDir || '';
  const outDir = joinDir(path.dirname(configPath), configFile.config.compilerOptions.outDir);
  const rootDir = joinDir(path.dirname(configPath), configFile.config.compilerOptions.rootDir);
  if (dev) {
    compilerOptions.sourceRoot = path.relative(outDir, rootDir);
  }

  if (compilerOptions.types) {
    compilerOptions.types = compilerOptions.types.map((name) => {
      const id = path.join(path.dirname(configPath), name);
      return path.isAbsolute(id) ? id : './' + id;
    });
  }


  // 解析 `tsconfig.json` 的内容
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );

  if (parsedCommandLine.errors?.length > 0) {
    parsedCommandLine.errors.map((m) => {
      logError(m.code, m.messageText.toString(), m.file?.fileName || configPath, m.start, m.length);
    });
    console.error(parsedCommandLine.errors.map((m) => m.messageText).join('\n'));
    process.exit(1);
  }


  return {
    outDir,
    rootDir,
    configPath,
    configFile,
    parsedCommandLine,
  };
}

export function tsc(project: string, extendOptions: ConfigOptions['compilerOptions']) {
  const { configFile, configPath, parsedCommandLine, rootDir, outDir } = resolveTSConfig(project, extendOptions);
  removeDist(outDir);

  // 创建程序对象
  const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);

  // 发出(生成)编译后的文件
  const emitResult = program.emit(undefined, undefined, undefined, undefined, createTransformers(program, true));

  // 处理发出的文件和报告发出后的诊断信息
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  if (allDiagnostics.length > 0) {
    const out = ts.formatDiagnosticsWithColorAndContext(allDiagnostics, ts.createCompilerHost(parsedCommandLine.options));
    console.log('Build failed!');
    console.log(out);
  }

  // 处理完成后的操作
  return {
    hasError: allDiagnostics.length > 0,
    emitResult,
    rootDir,
    outDir,
    config: configFile.config as ConfigOptions,
  };
}
