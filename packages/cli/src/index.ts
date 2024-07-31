import ts from 'typescript';
import path from 'path';
import enhanceTypeTransformer from './enhanceTypeTransformer';

// 查找 `tsconfig.json` 的路径
const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');

if (!configPath) {
  throw new Error('Could not find a valid \'tsconfig.json\'.');
}

// 读取 `tsconfig.json`
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

if (configFile.error) {
  const errorMessage = ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n');
  throw new Error(errorMessage);
}

// 解析 `tsconfig.json` 的内容
const parsedCommandLine = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);

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

// 自定义转换器配置
const customTransformers = {
  // 编译前转换器
  before: [
    enhanceTypeTransformer,
  ],
  // 编译后转换器
  after: [],
};

// 发出(生成)编译后的文件
const emitResult = program.emit(undefined, undefined, undefined, undefined, customTransformers);

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
const exitCode = emitResult.emitSkipped ? 1 : 0;
process.exit(exitCode);
