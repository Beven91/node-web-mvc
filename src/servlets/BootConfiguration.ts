import { HotOptions } from 'nodejs-hmr';
import RuntimeAnnotation from './annotations/annotation/RuntimeAnnotation';
import SpringBootApplication from './SpringBootApplication';
import path from 'path';

export default class BootConfiguration {
  private readonly bootConfigs: InstanceType<typeof SpringBootApplication>[];
  constructor(primarySources: Function[]) {
    this.bootConfigs = [];
    if (!primarySources) return;
    for (const primarySource of primarySources) {
      const configAnno = RuntimeAnnotation.getClassAnnotation(primarySource, SpringBootApplication);
      this.bootConfigs.push(configAnno.nativeAnnotation);
    }
    this.bootConfigs;
  }

  private resolvePaths(dirs: string | string[]) {
    const paths = dirs instanceof Array ? dirs : [ dirs ].filter(Boolean);
    return paths.map((m) => {
      return path.isAbsolute(m) ? m : path.resolve(m);
    });
  }

  getScanBasePackages(): string[] {
    const scanBasePackages = this.bootConfigs.reduce((v, item) => v.concat(item.scanBasePackages), []).filter(Boolean);
    if (scanBasePackages.length < 1) {
      return [ process.cwd() ];
    } else {
      return this.resolvePaths(scanBasePackages);
    }
  }

  getHotOptions(): HotOptions {
    const config = this.bootConfigs.find((m) => !!m.hot);
    if (!config?.hot) {
      return null;
    }
    let hot = config.hot as HotOptions;
    if (typeof config.hot == 'string' || config.hot instanceof Array) {
      hot = { cwd: config.hot as string };
    }
    return {
      ...hot,
      cwd: this.resolvePaths(hot.cwd),
    };
  }

  getExcludeScan() {
    const fileOrDirs = this.bootConfigs.reduce((v, item) => v.concat(item.excludeScan), []).filter(Boolean);
    return this.resolvePaths(fileOrDirs);
  }
}
