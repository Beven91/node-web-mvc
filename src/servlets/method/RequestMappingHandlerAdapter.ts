/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import ResourceHttpRequestHandler from '../resources/ResourceHttpRequestHandler';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {

  supportsInternal(handlerMethod: HandlerMethod) {
    return !(handlerMethod.bean instanceof ResourceHttpRequestHandler);
  }

  handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<any> {
    const argumentResolver = WebMvcConfigurationSupport.configurer.argumentResolver
    // 解析参数值
    const resolvedArgs = argumentResolver.resolveArguments(servletContext, handler);
    // 执行接口函数
    return Promise.resolve(resolvedArgs).then((args) => {
      // 返回结果
      return handler.invoke(servletContext, ...args);
    })
  }
}