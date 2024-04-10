import ServletExpressContext from './servlets/platforms/ServletExpressContext';
import ServletKoaContext from './servlets/platforms/ServletKoaContext';
import ServletNodeContext from './servlets/platforms/ServletNodeContext';
import { DrivedServletContextClazz } from './servlets/http/ServletContext';
import WebMvcConfigurationSupport from './servlets/config/WebMvcConfigurationSupport';
import ServletApplication from './servlets/ServletApplication';
import WebAppConfigurerOptions from './servlets/config/WebAppConfigurerOptions';

const runtime = {
  isLaunched: false
}

declare class ContextRegistration {
  [propName: string]: DrivedServletContextClazz
}

// 已经注册执行上下文
const registration: ContextRegistration = {}

export default class Registry {
  /**
   * 注册一个控制器上下文
   * @param {String} name 平台类型名
   * @param {Class} contextClass 控制器上下文类
   */
  static register(name: string, contextClass: DrivedServletContextClazz) {
    registration[name] = contextClass;
  }

  /**
   * 启动mvc
   * @param {Express} app express实例 
   */
  static launch(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    options = options || { mode: 'node', port: 8080 } as WebAppConfigurerOptions;
    // 获取当前中间件上下文
    const nativeHttpContextType = registration[options.mode || 'node'];
    if (runtime.isLaunched) {
      return console.error('服务已启动，请勿重复调用launch函数');
    }
    if (!nativeHttpContextType) {
      throw new Error(`
        当前${options.mode}模式不支持,
        您可以通过Registry.register来注册对应的执行上下文
        Registry.register('${options.mode}',ContextClass)
      `);
    }
    runtime.isLaunched = true;
    return new ServletApplication(nativeHttpContextType).run(options);
  }
}

// 注册express实现
Registry.register('express', ServletExpressContext);
// 注册koa实现
Registry.register('koa', ServletKoaContext);
// 注册node实现
Registry.register('node', ServletNodeContext);