import { logging, tsc } from './runtime/tsc';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

export interface RuntimeOptions {
  dir: string
  entry: string
  project: string
  pm2: string
  command: string
  compilerOptions: ts.CompilerOptions
}

const host = ts.createSolutionBuilderHost({
  ...ts.sys,
});

const defaultExclude = [ 'node_modules', 'dist' ];

export function parseOptions(command: string, entry: string, argv: string[]): RuntimeOptions {
  const baseOptions: Record<string, any> = {};
  const args: RuntimeOptions['compilerOptions'] = {};
  let key = '';
  let key2 = '';
  argv.forEach((arg: string) => {
    if (arg.startsWith('--')) {
      key = arg.slice(2);
      key2 = '';
      args[key] = true;
    } else if (arg.startsWith('-')) {
      key2 = arg.slice(1);
      key = '';
    } else if (key) {
      args[key] = arg === 'false' ? false : arg === 'true' ? true : arg;
    } else {
      baseOptions[key2] = arg;
    }
  });
  return {
    command: command,
    entry: entry,
    dir: process.cwd(),
    pm2: baseOptions.pm2,
    project: baseOptions.p,
    compilerOptions: args,
  };
};

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
    targetDir,
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
      logging(`Copy Resource: ${file}`);
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
  console.log('Build package.json');
  fs.writeFileSync(dest, JSON.stringify(pkg, null, 2));
}

function buildPM2(options: RuntimeOptions, rootDir: string, outDir: string) {
  if (!options.pm2) {
    return;
  }
  const id = path.join(options.dir, options.pm2);
  if (!fs.lstatSync(id).isFile()) {
    throw new Error('-pm2 must be a file path');
  }
  const dest = path.join(outDir, 'pm2.json');
  if (!fs.existsSync(id)) {
    return;
  }
  const applyAppInfo = (app) => {
    const file = path.join(path.dirname(id), app.script);
    const name = path.relative(rootDir, file);
    app.script = './' + name.replace('.ts', '.js');
    app.env = app.env || {};
    app.env['RUN_ENV'] = process.env.npm_config_env || '';
  };
  const pm2Config = JSON.parse(fs.readFileSync(id, 'utf-8'));
  const apps = pm2Config.apps;
  if (apps) {
    apps.forEach(applyAppInfo);
  } else {
    applyAppInfo(pm2Config);
  }
  console.log('Build pm2 config');
  fs.writeFileSync(dest, JSON.stringify(pm2Config, null, 2));
}

export default function build(options: RuntimeOptions) {
  logging('Start building application...');
  // 1. 执行tsc构建应用
  const info = tsc(options.compilerOptions, options.project);
  const outDir = info.outDir;
  const rootDir = info.rootDir;

  const exclude = info.config.exclude || defaultExclude;
  if (info.hasError) {
    // 如果构建失败 则直接结束
    process.exit(1);
  }
  // 2. 复制源码目录下其他资源文件
  copyResourceAndDirectories(rootDir, outDir, exclude);
  // 3. 在目标目录构建package.json
  buildPkg(options, outDir);
  // 4. 尝试构建pm2
  buildPM2(options, rootDir, outDir);
  logging('Build application successfully!');
}
