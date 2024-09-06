import http from 'http';
import https from 'https';
import http2 from 'http2';
import hot, { HotOptions, NodeHotModule } from '../hmr/src';
import { ClazzType } from '../interface/declare';
import ElementType from './annotations/annotation/ElementType';
import RuntimeAnnotation from './annotations/annotation/RuntimeAnnotation';
import Target from './annotations/Target';
import Tracer from './annotations/annotation/Tracer';

interface BaseServerOptions {
  /**
   * 设置当前服务的端口
   */
  port: number
  /**
  * 设置当前服务的基础路由目录 默认为 /
  */
  base?: string;
}

interface HttpServerOptions extends http.ServerOptions, BaseServerOptions {
  httpType?: 'http'
}

interface HttpsServerOptions extends https.ServerOptions, BaseServerOptions {
  httpType: 'https'
}

interface Http2ServerOptions extends http2.ServerOptions, BaseServerOptions {
  httpType: 'http2'
}

interface WithMainClass {
  main(): void
}

export type NodeServerOptions = HttpServerOptions | HttpsServerOptions | Http2ServerOptions;

export class SpringBootApplication {
  /**
   * 需要排除的自动配置类
   */
  exclude?: ClazzType[];

  /**
   * 根据名称来设定需要排除的自动配置类
   */
  excludeName?: string[];

  /**
   * 要排除的扫描文件
   */
  excludeScan?: string | string[];

  /**
   * 扫描模块目录， 默认为当前启动目录
   */
  scanBasePackages: string | string[];

  /**
   * 是否关闭默认的启动日志
   */
  launchLogOff?: boolean;

  /**
   * 是否开启swagger文档
   */
  swagger?: boolean;

  /**
   * 热更新配置
   * @param meta
   */
  hot?: HotOptions | HotOptions['cwd'];

  /**
   * http服务配置
   */
  server?: NodeServerOptions;

  /**
   * 是否为构建后的启动
   */
  isDist?: boolean;

  protected onInitialize() {
    if (this.isDist) {
      this.hot = null;
    }
  }


  constructor(meta: RuntimeAnnotation) {
    const clazz = meta.ctor as any as WithMainClass;
    registerHotUpdate(meta.ctor);
    if (typeof clazz.main === 'function') {
      setTimeout(() => {
        this.onInitialize();
        clazz.main();
      }, 10);
    }
  }
}

export default Target([ ElementType.TYPE ])(SpringBootApplication);

function registerHotUpdate(clazz: Function) {
  if (typeof require == 'function') {
    const tracer = Tracer.getTracer(clazz);
    const mod = (require.cache[tracer.id] || (require.main.filename == tracer.id ? require.main : null)) as NodeHotModule;
    if (mod && !mod.hot) {
      // 设定启动注解标记的类所在的文件 默认不进行热更新
      hot.create(mod).accept(() => { });
    }
  }
}
