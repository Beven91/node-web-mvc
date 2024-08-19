import { tsc } from './runtime/tsc';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

export interface RuntimeOptions {
  dir: string
  entry: string
  project: string
  compilerOptions: ts.CompilerOptions
}

const host = ts.createSolutionBuilderHost({
  ...ts.sys,
});

const defaultExclude = [ 'node_modules', 'dist' ];


function copyResourceAndDirectories(dir: string, targetDir: string, exclude: string[]) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 递归读取目录下的文件
  const files = host.readDirectory(dir, undefined, [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    'tsconfig.json',
    ...exclude,
  ]);
  for (const filePath of files) {
    const file = path.relative(dir, filePath);
    const targetFilePath = path.join(targetDir, file);
    const destDir = path.dirname(targetFilePath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      fs.copyFileSync(filePath, targetFilePath);
    }
  }
}

function buildPkg(options: RuntimeOptions, outDir: string) {
  const file = path.join(options.dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const dest = path.join(outDir, 'package.json');
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete pkg.bin;
  fs.writeFileSync(dest, JSON.stringify(pkg, null, 2));
}

export default function build(options: RuntimeOptions) {
  // 1. 执行tsc构建应用
  const info = tsc(options.compilerOptions, options.project);
  const outDir = info.outDir;
  const rootDir = info.rootDir;

  const exclude = info.config.exclude?.length < 1 ? defaultExclude : info.config.exclude;
  if (info.emitResult.emitSkipped) {
    // 如果构建失败 则直接结束
    process.exit(1);
  }
  // 2. 复制源码目录下其他资源文件
  copyResourceAndDirectories(rootDir, outDir, exclude);
  // 3. 在目标目录构建package.json
  buildPkg(options, outDir);
}
