/**
 * @module ServletKoaContext
 * @description koa框架接入上下文实现
 */
import ServletContext from './ServletContext';

export default class ServletKoaContext extends ServletContext {
  /**
   * 当前请求的path 例如: order/list
   */
  get path() {
    return this.request.path;
  }

  /**
  * 当前请求的谓词，例如: GET POST PUT DELETE等
  */
  get method() {
    return this.request.method;
  }

  /**
   * 返回内容到客户端
   * @param {any} data 要返回的数据
   * @param {number} status 当前设置的返回状态码
   * @param {String} procudes 当前返回的内容类型
   */
  end(data, status, procudes) {
    const response = this.response;
    if (procudes) {
      response.set('Content-Type', procudes);
    }
    response.status = status;
    response.body = data;
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback) {
    return function (context, next) {
      callback(context.request, context.response, next);
    }
  }
}