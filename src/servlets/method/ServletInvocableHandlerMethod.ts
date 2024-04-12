import ServletContext from "../http/ServletContext";
import InterruptModel from "../models/InterruptModel";
import HandlerMethod from "./HandlerMethod";
import MethodParameter from "./MethodParameter";
import HandlerMethodReturnValueHandler from "./return/HandlerMethodReturnValueHandler";
import HandlerMethodReturnValueHandlerComposite from "./return/HandlerMethodReturnValueHandlerComposite";


export default class ServletInvocableHandlerMethod {

  private returnvalueHandlers: HandlerMethodReturnValueHandler[]

  private readonly handlerMethod: HandlerMethod

  constructor(handlerMethod: HandlerMethod) {
    this.handlerMethod = handlerMethod;
  }

  setReturnValueHandlers(handlers: HandlerMethodReturnValueHandler[]) {
    this.returnvalueHandlers = handlers;
  }

  /**
   * 执行方法
   */
  public async invoke(servletContext: ServletContext, ...args: any[]) {
    const handlerMethod = this.handlerMethod;
    if (!handlerMethod.method) {
      return new InterruptModel();
    }
    const bean = handlerMethod.bean;
    // 优先从实例中获取method 用于支持aop代理
    const method = bean[handlerMethod.methodName] || handlerMethod.method;
    const returnValue = await Promise.resolve(method.call(bean, ...args));
    this.setResponseStatus(servletContext);
    // 如果response已处理结束
    if (servletContext.response.headersSent) {
      return new InterruptModel();
    }
    // 如果通过ResponseStatus指定了返回状态原因,则不执行返回处理
    if (handlerMethod.responseStatusReason) {
      return;
    }
    if (returnValue && returnValue instanceof InterruptModel) {
      // 如果是不执行任何操作
      return returnValue;
    }
    const returnType = new MethodParameter(handlerMethod.beanType, handlerMethod.methodName, '', -1, returnValue?.constructor);
    const returnHandlers = new HandlerMethodReturnValueHandlerComposite(this.returnvalueHandlers);
    await returnHandlers.handleReturnValue(returnValue, returnType, servletContext, handlerMethod);
    return returnValue;
  }


  private setResponseStatus(servletContext: ServletContext) {
    const handlerMethod = this.handlerMethod;
    const response = servletContext.response;
    if (!handlerMethod.responseStatus) {
      return;
    }
    if (handlerMethod.responseStatusReason) {
      response.sendError({ code: handlerMethod.responseStatus, message: handlerMethod.responseStatusReason });
    } else {
      response.setStatus(handlerMethod.responseStatus);
    }
  }
}