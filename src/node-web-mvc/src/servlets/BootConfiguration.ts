import { HotOptions } from '../hmr/src';
import RuntimeAnnotation from './annotations/annotation/RuntimeAnnotation';
import SpringBootApplication, { NodeServerOptions } from './SpringBootApplication';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const arrayContact = (items: string[], source: string | string[] | undefined)=> {
  if (!source) {
    return items;
  }
  if (source instanceof Array) {
    return items.concat(source);
  } else {
    items.push(source);
    return items;
  }
};

export default class BootConfiguration {
  private readonly annoConfigs: InstanceType<typeof SpringBootApplication>[];

  private serverOptions: NodeServerOptions;

  constructor(primarySources: Function[]) {
    this.annoConfigs = [];
    if (!primarySources) return;
    for (const primarySource of primarySources) {
      const configAnno = RuntimeAnnotation.getClassAnnotation(primarySource, SpringBootApplication);
      this.annoConfigs.push(configAnno.nativeAnnotation);
    }
    this.annoConfigs;
  }

  private resolvePaths(dirs: string | string[]) {
    const paths = dirs instanceof Array ? dirs : [ dirs ].filter(Boolean);
    return paths.map((m) => {
      return path.isAbsolute(m) ? m : path.resolve(m);
    });
  }

  getScanBasePackages(): string[] {
    const scanBasePackages = this.annoConfigs.reduce((v, item) => arrayContact(v, item.scanBasePackages), [] as string[]).filter(Boolean);
    if (scanBasePackages.length < 1) {
      return [ process.cwd() ];
    } else {
      return this.resolvePaths(scanBasePackages);
    }
  }

  getHotOptions(): HotOptions | null {
    if (isProduction) {
      // 生产模式无论如何禁止热更新
      return null;
    }
    const config = this.annoConfigs.find((m) => !!m.hot);
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
      this.annoConfigs.forEach((m) => {
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
    const fileOrDirs = this.annoConfigs.reduce((v, item) => arrayContact(v, item.excludeScan), [] as string[]).filter(Boolean);
    return (fileOrDirs);
  }

  getLaunchLogOff(): boolean {
    return !!this.annoConfigs[0]?.launchLogOff;
  }

  getPort(): number {
    return this.getServerOptions().port;
  }

  getEanbleSwagger(): boolean {
    return this.annoConfigs[0]?.swagger === true;
  }
}
