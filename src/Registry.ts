import ServletExpressContext from './servlets/ServletExpressContext';
import ServletKoaContext from './servlets/ServletKoaContext';
import ControllerFactory from './ControllerFactory';
import ServletContext from './servlets/ServletContext';
import InterceptorRegistry from './interceptor/InterceptorRegistry'

interface LaunchOptions {
  // 当前类型
  mode: string,
  // 是否开启swagger文档
  swagger?: boolean,
  // 注册拦截器
  addInterceptors?: (registry: InterceptorRegistry) => void
}

// 已经注册执行上下文
const registration: Map<string, typeof ServletContext> = ({}) as Map<string, typeof ServletContext>

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
  static launch(options: LaunchOptions) {
    if (!options) {
      throw new Error('请设置options属性,例如:' + JSON.stringify({ mode: 'express|koa' }));
    }
    const ControllerContext = registration[options.mode];
    if (!ControllerContext) {
      throw new Error(`
        当前${options.mode}模式不支持,
        您可以通过Registry.register来注册对应的执行上下文
        Registry.register('${options.mode}',ContextClass)
      `);
    }
    if (options.swagger !== false) {
      // 如果使用swagger
      require('./swagger/index.ts');
    }
    // 注册拦截器
    if (options.addInterceptors) {
      options.addInterceptors(InterceptorRegistry.getInstance());
    }
    return ControllerContext.launch((request, response, next) => {
      const context: ServletContext = new ControllerContext(request, response, next);
      ControllerFactory.defaultFactory.handle(context);
    });
  }
}

// 注册express实现
Registry.register('express', ServletExpressContext);
// 注册koa实现
Registry.register('koa', ServletKoaContext);