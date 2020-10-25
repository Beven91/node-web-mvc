/**
 * @module ResourceHandlerAdapter
 * @description 用于处理 resource
 */
import AbstractHandlerMethodAdapter from '../method/AbstractHandlerMethodAdapter';
import HandlerMethod from '../method/HandlerMethod';
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import ResourceHttpRequestHandler from './ResourceHttpRequestHandler';
import InterruptModel from '../models/InterruptModel';

export default class ResourceHandlerAdapter extends AbstractHandlerMethodAdapter {

  supportsInternal(handlerMethod: HandlerMethod) {
    return handlerMethod.bean instanceof ResourceHttpRequestHandler;
  }

  async handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<ServletModel> {
    try {
      const invoker = handler.bean as ResourceHttpRequestHandler;
      // 处理请求
      invoker.handleRequest(servletContext.request, servletContext.response);
      return Promise.resolve(new InterruptModel(true));
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}