/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import WebAppConfigurer from '../WebAppConfigurer';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {

  supportsInternal(handlerMethod: HandlerMethod) {
    return true
  }

  handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<ServletModel> {
    const argumentResolver = WebAppConfigurer.configurer.argumentResolver
    // 解析参数值
    const resolvedArgs = argumentResolver.resolveArguments(servletContext, handler);
    // 执行接口函数
    return Promise.resolve(resolvedArgs).then((args) => {
      // 返回结果
      return handler.invoke(...args);
    })
  }
}