import ServletExpressContext from './servlets/platforms/ServletExpressContext';
import ServletKoaContext from './servlets/platforms/ServletKoaContext';
import ServletNodeContext from './servlets/platforms/ServletNodeContext';
import ControllerFactory from './ControllerFactory';
import ServletContext from './servlets/http/ServletContext';
import RouteCollection from './routes/RouteCollection';
import WebAppConfigurer, { WebAppConfigurerOptions } from './servlets/WebAppConfigurer';

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
   * 根据指定目录统一注册Controller
   * @static
   * @param {String} dir 目录地址
   */
  static registerControllers(dir: string) {
    return ControllerFactory.registerControllers(dir);
  }

  /**
   * 启动mvc
   * @param {Express} app express实例 
   */
  static launch(options: WebAppConfigurerOptions) {
    if (!options) {
      throw new Error('请设置options属性,例如:' + JSON.stringify({ mode: 'express|koa' }));
    }
    // 初始化全局配置
    const configure = WebAppConfigurer.configurer.initialize(options);
    // 获取当前中间件上下文
    const HttpContext = registration[configure.mode];
    if (!HttpContext) {
      throw new Error(`
        当前${options.mode}模式不支持,
        您可以通过Registry.register来注册对应的执行上下文
        Registry.register('${options.mode}',ContextClass)
      `);
    }
    // 设置基础路由路径
    RouteCollection.base = configure.contextPath;
    // 返回中间件
    return HttpContext.launch((request, response, next) => {
      new Promise((resolve) => {
        const HttpServletContext = HttpContext as any;
        const context: ServletContext = new HttpServletContext(configure, request, response, next);
        ControllerFactory.defaultFactory.handle(context);
        resolve();
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