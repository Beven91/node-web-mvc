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

export default class CachableIncrementalProgram {
  private data: Record<string, any>;

  private formatHost: ts.CompilerHost;

  private filePath: string;

  private timerId: ReturnType<typeof setTimeout>;

  private saveTimerId: ReturnType<typeof setTimeout>;

  private program: ts.BuilderProgram;

  private host: ts.CompilerHost;

  private parsedCommandLine: ts.ParsedCommandLine;

  private isCacheInit: boolean;

  private rootDir: string;

  private outDir: string;

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
    const { parsedCommandLine, outDir, rootDir } = resolveTSConfig(project, selfOptions, false, true);
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
    (global as MyGlobal).nodeWebMvcStarter = {
      resolveOutputFile: this.getOutFileName.bind(this),
      rootDir: rootDir,
      outDir: outDir,
    };
    this.rootDir = rootDir;
    this.outDir = outDir;
  }

  private filterFiles(files: string[]) {
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

  private updateFileVersion(sourceFile: ts.SourceFile) {
    this.data[sourceFile.fileName] = this.formatHost.createHash(sourceFile.getFullText());
  }

  private saveManifest(program: ts.Program) {
    this.data = {};
    const manifest = this.data;
    const files = program.getSourceFiles();
    files.map((file) => {
      this.updateFileVersion(file);
    });
    this.data[configName] = this.formatHost.createHash(JSON.stringify(this.parsedCommandLine.options));
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

  private watch() {
    fs.watch(this.rootDir, { recursive: true }, (type, filePath) => {
      const id = path.join(this.rootDir, filePath);
      if (!require.cache[id] || this.program.getSourceFile(id)) {
        this.emitHotUpdate(id);
      }
    });
  }

  private onFinished(emitResult: ts.EmitResult, sourceFile?: ts.SourceFile) {
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
      if (!this.isInitialized) {
        this.watch();
      }
      this.isInitialized = true;
      if (this.isCacheInit) {
        // 如果是使用缓存，在此时进行增量编译
        this.emitHotUpdate('');
      } else {
        this.onFinished(emitResult);
      }
    }, 16);
  }

  getOutFileName(filename: string) {
    const name = path.relative(this.rootDir, filename);
    return path.join(this.outDir, name.replace('.ts', '.js'));
  }
}
