/**
 * @module ServletKoaContext
 * @description koa框架接入上下文实现
 */
import ServletContext, { ServerLaunchOptions } from '../http/ServletContext';

export default class ServletKoaContext extends ServletContext {
  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * @param options 
   */
  static launch(options: ServerLaunchOptions) {
    const handler = options.handler;
    return function (context, next) {
      handler(context.request, context.response, next);
    }
  }
}