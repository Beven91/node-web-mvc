import ServletExpressContext from './servlets/platforms/ServletExpressContext';
import ServletKoaContext from './servlets/platforms/ServletKoaContext';
import ServletNodeContext from './servlets/platforms/ServletNodeContext';
import ServletContext from './servlets/http/ServletContext';
import DispatcherServlet from './servlets/dispatch/DispatcherServlet';
import WebMvcConfigurationSupport, { WebAppConfigurerOptions } from './servlets/config/WebMvcConfigurationSupport';

declare class ContextRegistration {
  [propName: string]: typeof ServletContext
}

// 已经注册执行上下文
const registration: ContextRegistration = {}

export default class Registry {
  /**
   * 注册一个控制器上下文
   * @param {String} name 平台类型名
   * @param {Class} contextClass 控制器上下文类
   */
  static register(name: string, contextClass: typeof ServletContext) {
    registration[name] = contextClass;
  }

  /**
   * 启动mvc
   * @param {Express} app express实例 
   */
  static launch(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    if (!options) {
      throw new Error('请设置options属性,例如:' + JSON.stringify({ mode: 'express|koa' }));
    }
    if (WebMvcConfigurationSupport.configurer) {
      return console.error('服务已启动，请勿重复调用launch函数');
    }
    // 初始化全局配置
    const configurer = WebMvcConfigurationSupport.initialize(options);
    // 获取当前中间件上下文
    const HttpContext = registration[configurer.mode || 'node'];
    if (!HttpContext) {
      throw new Error(`
        当前${options.mode}模式不支持,
        您可以通过Registry.register来注册对应的执行上下文
        Registry.register('${options.mode}',ContextClass)
      `);
    }
    if (options.onLaunch) {
      options.onLaunch();
    }
    // 返回中间件
    return HttpContext.launch((request, response, next) => {
      if (request.path.indexOf(configurer.base) !== 0) {
        return next();
      }
      new Promise((resolve) => {
        const HttpServletContext = HttpContext as any;
        const context: ServletContext = new HttpServletContext(configurer, request, response, next);
        new DispatcherServlet().doService(context);
        // ControllerFactory.defaultFactory.handle(context);
        resolve({});
      })
        .catch((ex) => {
          console.error(ex);
          response.status(500).end();
        })
    });
  }
}

// 注册express实现
Registry.register('express', ServletExpressContext);
// 注册koa实现
Registry.register('koa', ServletKoaContext);
// 注册node实现
Registry.register('node', ServletNodeContext);