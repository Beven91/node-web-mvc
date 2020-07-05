/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import ArgumentsResolvers from './argument/ArgumentsResolvers';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {

  supportsInternal() {
    return true;
  }

  handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<ServletModel> {
    // 解析参数值
    const resolvedArgs = ArgumentsResolvers.resolveArguments(servletContext, handler);
    // 执行接口函数
    return Promise.resolve(resolvedArgs).then((args) => {
      // 返回结果
      return handler.invoke(...args);
    })
  }
}