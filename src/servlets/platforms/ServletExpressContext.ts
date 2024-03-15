/**
 * @module ServletExpressContext
 * @description 用于实现在express框架下运行mvc的请求上下文
 */
import ServletContext, { ServerLaunchOptions } from '../http/ServletContext';

export default class ServletExpressContext extends ServletContext {
  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param { ServerLaunchOptions } options 
   */
  static launch(options: ServerLaunchOptions) {
    const callback = options.handler;
    return function (request, response, next) {
      callback(request, response, next);
    }
  }
}