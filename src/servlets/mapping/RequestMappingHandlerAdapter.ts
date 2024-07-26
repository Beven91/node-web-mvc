/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from '../method/AbstractHandlerMethodAdapter';
import HandlerMethod from '../method/HandlerMethod';
import ServletContext from '../http/ServletContext';
import ArgumentsResolvers from '../method/argument/ArgumentsResolvers';
import ServletInvocableHandlerMethod from '../method/ServletInvocableHandlerMethod';
import HandlerMethodReturnValueHandler from '../method/return/HandlerMethodReturnValueHandler';
import ModelAndViewContainer from '../models/ModelAndViewContainer';
import ModelAndView from '../models/ModelAndView';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {
  private argumentResolver: ArgumentsResolvers;

  private returnvalueHandlers: HandlerMethodReturnValueHandler[];

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

  supportsInternal(handler: object) {
    return handler instanceof HandlerMethod;
  }

  async handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<any> {
    const argumentResolver = this.argumentResolver;
    const mavContainer = new ModelAndViewContainer();
    const invocableMethod = new ServletInvocableHandlerMethod(handler);
    // 设置返回处理器
    invocableMethod.setReturnValueHandlers(this.getReturnvalueHandlers());
    // 解析参数值
    const resolvedArgs = await argumentResolver.resolveArguments(servletContext, handler);
    // 执行接口函数
    await invocableMethod.invoke(servletContext, mavContainer, resolvedArgs);

    if (mavContainer.requestHandled) {
      return null;
    }

    return new ModelAndView(mavContainer.view, mavContainer.model, mavContainer.status);
  }
}
