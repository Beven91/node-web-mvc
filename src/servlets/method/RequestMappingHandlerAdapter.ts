/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../http/ServletContext';
import ResourceHttpRequestHandler from '../resources/ResourceHttpRequestHandler';
import ArgumentsResolvers from './argument/ArgumentsResolvers';
import ServletInvocableHandlerMethod from './ServletInvocableHandlerMethod';
import HandlerMethodReturnValueHandler from './return/HandlerMethodReturnValueHandler';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {

  private argumentResolver: ArgumentsResolvers;

  private returnvalueHandlers: HandlerMethodReturnValueHandler[]

  public setArgumentResolver(value: ArgumentsResolvers) {
    this.argumentResolver = value;
  }

  public getArgumentResolver() {
    return this.argumentResolver;
  }

  public setReturnvalueHandlers(value: HandlerMethodReturnValueHandler[]) {
    this.returnvalueHandlers = value;
  }

  public getReturnvalueHandlers() {
    return this.returnvalueHandlers;
  }

  supportsInternal(handlerMethod: HandlerMethod) {
    return !(handlerMethod.bean instanceof ResourceHttpRequestHandler);
  }

  handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<any> {
    const argumentResolver = this.argumentResolver;
    const invocableMethod = new ServletInvocableHandlerMethod(handler);
    // 设置返回处理器
    invocableMethod.setReturnValueHandlers(this.getReturnvalueHandlers());
    // 解析参数值
    const resolvedArgs = argumentResolver.resolveArguments(servletContext, handler);
    // 执行接口函数
    return Promise.resolve(resolvedArgs).then((args) => {
      // 返回结果
      return invocableMethod.invoke(servletContext, ...args);
    })
  }
}