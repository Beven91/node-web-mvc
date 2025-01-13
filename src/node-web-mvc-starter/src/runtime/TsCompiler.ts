import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { createTransformers } from '../transformers';
import { resolveTSConfig } from './tsc';
import type { MyGlobal } from 'shared-types';

const suffix = process.env.NCACHE_NAME || '';
const cacheDir = path.resolve('node_modules/.ncache/' + suffix);
const manifestFile = path.join(cacheDir, 'manifest.json');
const configName = 'tsconfig.json';

export default class TsCompiler {
  private data: Record<string, any>;

  private formatHost: ts.CompilerHost;

  private filePath: string;

  private saveTimerId: ReturnType<typeof setTimeout>;

  private program: ts.BuilderProgram;

  private host: ts.CompilerHost;

  private parsedCommandLine: ts.ParsedCommandLine;

  private rootDir: string;

  private isIncrementInit: boolean;

  private outDir: string;
  public get cacheDir() {
    return cacheDir;
  }

  constructor(project: string) {
    this.data = {};
    this.filePath = manifestFile;
    if (fs.existsSync(manifestFile)) {
      this.data = JSON.parse(fs.readFileSync(manifestFile).toString('utf-8'));
    }
    const selfOptions: ts.CompilerOptions = {
      inlineSourceMap: true,
      sourceMap: false,
      incremental: true,
      tsBuildInfoFile: path.join(cacheDir, './tsBuildInfo.json'),
      outDir: path.join(cacheDir, 'dist'),
    };
    const { parsedCommandLine, outDir, rootDir } = resolveTSConfig(project, selfOptions, false, true);
    this.rootDir = rootDir;
    this.outDir = outDir;
    this.parsedCommandLine = parsedCommandLine;
    this.host = ts.createIncrementalCompilerHost(parsedCommandLine.options);
    this.formatHost = ts.createCompilerHost(parsedCommandLine.options);
    const incrementFiles = this.findIncrementFiles(parsedCommandLine.fileNames);
    this.isIncrementInit = incrementFiles.length != parsedCommandLine.fileNames.length;
    this.program = ts.createIncrementalProgram({
      rootNames: incrementFiles,
      options: parsedCommandLine.options,
      host: this.host,
    });
    (global as MyGlobal).nodeWebMvcStarter = {
      resolveOutputFile: this.getOutFileName.bind(this),
      rootDir: rootDir,
      outDir: outDir,
    };
  }

  /**
   * 返回需要增量编译的文件
   * @param files 需要编译的文件
   * @returns {String[]} 需要增量编译的文件
   */
  private findIncrementFiles(files: string[]) {
    const configHash = this.formatHost.createHash(JSON.stringify(this.parsedCommandLine.options));
    if (this.data[configName] != configHash) {
      // 如果配置发生变更，则需要全部重新编译
      return files;
    }
    return files.filter((file) => {
      if (!this.data[file]) {
        return true;
      }
      const hash = this.formatHost.createHash(ts.sys.readFile(file));
      return this.data[file] !== hash;
    });
  }

  /**
   * 判定当前文件是否需要热更新状态
   * @param filename 文件绝对路径
   * @returns
   */
  private checkFileHotUpdate(filename: string, isRemove: boolean) {
    if (!filename || isRemove) {
      return 'change';
    }
    if (!fs.existsSync(this.getOutFileName(filename))) {
      // 如果目标文件不存在，则需删除tsBuildInfo.json，用以达到重新构建的目的
      return 'dist-delete';
    }
    const hash = this.formatHost.createHash(ts.sys.readFile(filename));
    if (this.data[filename] !== hash) {
      return 'change';
    }
    return 'skip';
  }

  /**
   * 编译项目
   * @returns
   */
  private emitInternal() {
    return this.program.emit(undefined, undefined, undefined, undefined, createTransformers(this.program.getProgram(), false));
  }

  /**
   * 初始化编译
   */
  init() {
    const emitResult = this.emitInternal();
    this.saveCompileManifest(emitResult);
    this.watch();
  }

  /**
   * 单文件编译
   * @param filename
   * @param isRemoved
   * @returns 返回编译后文件的完整路径
   */
  compile(filename: string, isRemoved = false): string {
    const oldProgram = this.program;
    const host = this.host;
    const files = this.parsedCommandLine.fileNames;
    const idx = files.indexOf(filename);
    const outId = this.getOutFileName(filename);
    if (isRemoved) {
      idx > -1 && files.splice(idx, 1);
    } else if (filename && idx < 0) {
      files.push(filename);
    }
    const status = this.checkFileHotUpdate(filename, isRemoved);
    if (status == 'skip') {
      return outId;
    }
    // 如果是热更新
    this.program = ts.createIncrementalProgram({
      rootNames: files,
      options: oldProgram.getCompilerOptions(),
      host: {
        ...host,
        // 重写getSourceFile 用于控制热更新时能获取最新的源文件内容
        getSourceFile(name, v) {
          if (name == filename) {
            const sourceFile = host.getSourceFile(name, v);
            const version = (sourceFile as any).version;
            if (status == 'dist-delete') {
              // 如果构建文件意外被删除，这里需要强制重新构建当前文件
              (sourceFile as any).version = version + '_' + Date.now();
            }
            return sourceFile;
          }
          return oldProgram.getSourceFile(name) || host.getSourceFile(name, v);
        },
      },
    });
    const emitResult = this.emitInternal();
    this.saveCompileManifest(emitResult, this.program.getSourceFile(filename));
    return outId;
  }

  /**
   * 启动源文件变动监听
   */
  private watch() {
    const extensions = [ '.ts', '.tsx', '.d.ts', '.cts', '.d.cts', '.mts', '.d.mts' ];
    fs.watch(this.rootDir, { recursive: true }, (type, filePath) => {
      if (/node_modules/i.test(filePath) || extensions.indexOf(path.extname(filePath)) < 0) {
        // 不监听node_modules变化
        return;
      }
      const id = path.join(this.rootDir, filePath);
      const isRemoved = !fs.existsSync(id);
      if (!require.cache[id] || this.program.getSourceFile(id)) {
        this.compile(id, isRemoved);
      }
    });
  }

  /**
   * 保存编译清单文件信息
   * @param emitResult 编译结果
   * @param sourceFile 如果为单文件编译，则需要传入该文件信息
   */
  private saveCompileManifest(emitResult: ts.EmitResult, sourceFile?: ts.SourceFile) {
    const program = this.program.getProgram();
    const allDiagnostics = ts.getPreEmitDiagnostics(program, sourceFile).concat(emitResult.diagnostics);
    if (allDiagnostics?.length > 0) {
      // 输出诊断日志
      const out = ts.formatDiagnosticsWithColorAndContext(allDiagnostics, this.formatHost);
      allDiagnostics.length = 0;
      console.log(out);
    }
    if (sourceFile) {
      // 增量写出manifest
      this.data[sourceFile.fileName] = this.formatHost.createHash(sourceFile.getFullText());
      clearTimeout(this.saveTimerId);
      this.saveTimerId = setTimeout(() => {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
      });
    } else {
      // 全量写出manifest
      const manifest = this.data;
      const files = program.getSourceFiles();
      files.map((file) => {
        this.data[file.fileName] = this.formatHost.createHash(file.getFullText());
      });
      this.data[configName] = this.formatHost.createHash(JSON.stringify(this.parsedCommandLine.options));
      fs.writeFileSync(this.filePath, JSON.stringify(manifest, null, 2));
    }
  }

  /**
   * 在初始化所有增量文件编译完毕后
   */
  afterInitCompile() {
    if (this.isIncrementInit) {
      // 如果是增量编译，这里需要补全全量编译信息
      setTimeout(() => {
        this.compile('');
      }, 100);
    }
  }

  getOutFileName(filename: string) {
    const name = path.relative(this.rootDir, filename);
    return path.join(this.outDir, name.replace('.ts', '.js'));
  }
}
