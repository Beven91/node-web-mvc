import { HotOptions } from 'nodejs-hmr';
import RuntimeAnnotation from './annotations/annotation/RuntimeAnnotation';
import SpringBootApplication, { NodeServerOptions } from './SpringBootApplication';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default class BootConfiguration {
  private readonly bootConfigs: InstanceType<typeof SpringBootApplication>[];

  private serverOptions: NodeServerOptions;

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
    if (isProduction) {
      // 生产模式无论如何禁止热更新
      return null;
    }
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

  getServerOptions(): NodeServerOptions {
    if (!this.serverOptions) {
      let config: NodeServerOptions = {} as NodeServerOptions;
      this.bootConfigs.forEach((m) => {
        config = {
          ...config,
          ...m.server,
        };
      });
      this.serverOptions = config;
    }
    this.serverOptions.port = this.serverOptions.port || 8080;
    return this.serverOptions;
  }

  getExcludeScan(): string[] {
    const fileOrDirs = this.bootConfigs.reduce((v, item) => v.concat(item.excludeScan), []).filter(Boolean);
    return this.resolvePaths(fileOrDirs);
  }

  getLaunchLogOff(): boolean {
    return this.bootConfigs[0]?.launchLogOff;
  }

  getPort(): number {
    return this.getServerOptions().port;
  }

  getEanbleSwagger(): boolean {
    return this.bootConfigs[0]?.swagger === true;
  }
}
