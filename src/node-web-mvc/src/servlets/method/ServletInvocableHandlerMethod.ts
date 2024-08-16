import { buildRuntimeType } from '../annotations/annotation/metadata';
import { MetaRuntimeTypeInfo } from '../annotations/annotation/type';
import HttpStatus from '../http/HttpStatus';
import ServletContext from '../http/ServletContext';
import ModelAndViewContainer from '../models/ModelAndViewContainer';
import HandlerMethod from './HandlerMethod';
import MethodParameter from './MethodParameter';
import HandlerMethodReturnValueHandler from './return/HandlerMethodReturnValueHandler';
import HandlerMethodReturnValueHandlerComposite from './return/HandlerMethodReturnValueHandlerComposite';

const NOOP = {};

export default class ServletInvocableHandlerMethod {
  private returnvalueHandlers: HandlerMethodReturnValueHandler[];

  private readonly handlerMethod: HandlerMethod;

  constructor(handlerMethod: HandlerMethod) {
    this.handlerMethod = handlerMethod;
  }

  setReturnValueHandlers(handlers: HandlerMethodReturnValueHandler[]) {
    this.returnvalueHandlers = handlers;
  }

  /**
   * 执行方法
   */
  public async invoke(servletContext: ServletContext, mavContainer: ModelAndViewContainer, args: any[]) {
    const handlerMethod = this.handlerMethod;
    if (!handlerMethod.method) {
      return null;
    }
    const response = servletContext.response;
    const bean = handlerMethod.bean || NOOP;
    // 优先从实例中获取method 用于支持aop代理
    const method = bean[handlerMethod.methodName] || handlerMethod.method;
    const returnValue = await Promise.resolve(method.call(bean, ...args));
    this.setResponseStatus(servletContext);
    // 设置请求是否已处理
    mavContainer.requestHandled = response.headersSent;
    mavContainer.status = response.status;
    // 如果response已处理结束
    if (response.headersSent) {
      return null;
    }
    // 如果通过ResponseStatus指定了返回状态原因,则不执行返回处理
    if (handlerMethod.responseStatusReason) {
      return;
    }
    const runtimeType: MetaRuntimeTypeInfo = buildRuntimeType(returnValue?.constructor, null);
    const returnType = new MethodParameter(handlerMethod.beanType, handlerMethod.methodName, '', -1, runtimeType);
    const returnHandlers = new HandlerMethodReturnValueHandlerComposite(this.returnvalueHandlers);
    await returnHandlers.handleReturnValue(returnValue, returnType, servletContext, mavContainer);
    mavContainer.requestHandled = response.headersSent;
    mavContainer.status = response.status;
    return returnValue;
  }

  private setResponseStatus(servletContext: ServletContext) {
    const handlerMethod = this.handlerMethod;
    const response = servletContext.response;
    if (!handlerMethod.responseStatus) {
      return;
    }
    if (handlerMethod.responseStatusReason) {
      const status = new HttpStatus(handlerMethod.responseStatus, handlerMethod.responseStatusReason);
      response.sendError(status);
    } else {
      response.setStatus(handlerMethod.responseStatus);
    }
  }
}
