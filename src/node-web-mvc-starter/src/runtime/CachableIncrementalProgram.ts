import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { createTransformers } from '../transformers';
import { resolveTSConfig } from './tsc';

const cacheDir = path.resolve('node_modules/.ncache/');
const manifestFile = path.join(cacheDir, 'manifest.json');

export default class CachableIncrementalProgram {
  private readonly data: Record<string, any>;

  private formatHost: ts.CompilerHost;

  private filePath: string;

  private timerId: ReturnType<typeof setTimeout>;

  private saveTimerId: ReturnType<typeof setTimeout>;

  private program: ts.BuilderProgram;

  private host: ts.CompilerHost;

  private parsedCommandLine: ts.ParsedCommandLine;

  private isCacheInit: boolean;

  public isInitialized: boolean;

  public get cacheDir() {
    return cacheDir;
  }

  constructor(project: string) {
    this.data = {};
    this.isInitialized = false;
    this.filePath = manifestFile;
    if (fs.existsSync(manifestFile)) {
      this.data = JSON.parse(fs.readFileSync(manifestFile).toString('utf-8'));
    }
    this.initProgram(project);
  }

  private initProgram(project: string) {
    const selfOptions: ts.CompilerOptions = {
      inlineSourceMap: true,
      sourceMap: false,
      incremental: true,
      tsBuildInfoFile: path.join(cacheDir, './tsBuildInfo.json'),
      outDir: path.join(cacheDir, 'dist'),
    };
    const { parsedCommandLine } = resolveTSConfig(project, selfOptions, false, true);
    this.parsedCommandLine = parsedCommandLine;
    this.host = ts.createIncrementalCompilerHost(parsedCommandLine.options);
    this.formatHost = ts.createCompilerHost(parsedCommandLine.options);
    const fileNames = this.filterFiles(parsedCommandLine.fileNames);
    this.isCacheInit = fileNames.length !== parsedCommandLine.fileNames.length;
    this.program = ts.createIncrementalProgram({
      rootNames: fileNames,
      options: parsedCommandLine.options,
      host: this.host,
    });
  }

  private filterFiles(files: string[]) {
    return files.filter((file) => {
      if (!this.data[file]) {
        return true;
      }
      const hash = this.formatHost.createHash(ts.sys.readFile(file));
      return this.data[file] !== hash;
    });
  }

  private updateFileVersion(sourceFile: ts.SourceFile) {
    this.data[sourceFile.fileName] = this.formatHost.createHash(sourceFile.getFullText());
  }

  private saveManifest(program: ts.Program) {
    const manifest = this.data;
    const files = program.getSourceFiles();
    files.map((file) => {
      this.updateFileVersion(file);
    });
    fs.writeFileSync(this.filePath, JSON.stringify(manifest, null, 2));
  }

  emit() {
    return this.program.emit(undefined, undefined, undefined, undefined, createTransformers(this.program.getProgram(), false));
  }

  emitHotUpdate(filename: string) {
    const oldProgram = this.program;
    const host = this.host;
    const files = this.parsedCommandLine.fileNames;
    if (filename && files.indexOf(filename) < 0) {
      files.push(filename);
    }
    // 如果是热更新
    this.program = ts.createIncrementalProgram({
      rootNames: files,
      options: oldProgram.getCompilerOptions(),
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
    const emitResult = this.emit();
    this.onFinished(emitResult, this.program.getSourceFile(filename));
  }

  onFinished(emitResult: ts.EmitResult, sourceFile?: ts.SourceFile) {
    const program = this.program.getProgram();
    const allDiagnostics = ts.getPreEmitDiagnostics(program, sourceFile).concat(emitResult.diagnostics);
    if (allDiagnostics?.length > 0) {
      // 输出诊断日志
      const out = ts.formatDiagnosticsWithColorAndContext(allDiagnostics, this.formatHost);
      allDiagnostics.length = 0;
      console.log(out);
    }
    if (sourceFile) {
      this.updateFileVersion(sourceFile);
      clearTimeout(this.saveTimerId);
      this.saveTimerId = setTimeout(() => {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
      });
    } else {
      // 输出清单文件
      this.saveManifest(program);
    }
  }

  tryOnInitEmitFinished(emitResult: ts.EmitResult) {
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.isInitialized = true;
      this.onFinished(emitResult);
      if (this.isCacheInit) {
        // 如果是使用缓存，在此时进行增量编译
        this.emitHotUpdate('');
      }
    }, 16);
  }

  getOutFileName(filename: string) {
    const parsedCommandLine = this.parsedCommandLine;
    const name = path.relative(parsedCommandLine.options.rootDir, filename);
    return path.join(parsedCommandLine.options.outDir, name.replace('.ts', '.js'));
  }
}
