/**
 * @module ResourceHandlerAdapter
 * @description 用于处理 resource
 */
import ServletContext from '../http/ServletContext';
import HttpRequestHandler from './HttpRequestHandler';
import HandlerAdapter from '../method/HandlerAdapter';
import HttpServletRequest from './HttpServletRequest';

export default class HttpRequestHandlerAdapter extends HandlerAdapter {
  supports(handler: object) {
    return typeof (handler as HttpRequestHandler)?.handleRequest === 'function';
  }

  async handle(servletContext: ServletContext, handler: object) {
    try {
      const invoker = handler as HttpRequestHandler;
      // 处理请求
      await invoker.handleRequest(servletContext.request, servletContext.response);
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  getLastModified(request: HttpServletRequest, handler: any) {
    return -1;
  }
}
