import ControllerAdvice from "../../annotations/ControllerAdvice";
import ExceptionHandler from "../../annotations/ExceptionHandler";
import RuntimeAnnotation from "../../annotations/annotation/RuntimeAnnotation";
import ServletContext from "../../http/ServletContext";
import HandlerMethod from "../HandlerMethod";
import ServletInvocableHandlerMethod from "../ServletInvocableHandlerMethod";
import HandlerMethodReturnValueHandler from "../return/HandlerMethodReturnValueHandler";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class ExceptionHandlerExceptionResolver implements HandlerExceptionResolver {

  private readonly returnValueHandlers: HandlerMethodReturnValueHandler[]

  constructor(returnValueHandlers: HandlerMethodReturnValueHandler[]) {
    this.returnValueHandlers = returnValueHandlers;
  }

  async resolveException(servletContext: ServletContext, handlerMethod: HandlerMethod, error: Error) {
    try {
      const adviceAnnotation = RuntimeAnnotation.getAnnotations(ControllerAdvice)[0];
      const globalAnnotation = RuntimeAnnotation.getAnnotation(ExceptionHandler, adviceAnnotation?.ctor);
      const scopeAnnotation = RuntimeAnnotation.getAnnotation(ExceptionHandler, handlerMethod.beanType);
      const exceptionAnnotation = scopeAnnotation || globalAnnotation;
      if (exceptionAnnotation) {
        const handlerMethod = new HandlerMethod(exceptionAnnotation.ctor, exceptionAnnotation.method);
        const exceptionHandlerMethod = new ServletInvocableHandlerMethod(handlerMethod);
        exceptionHandlerMethod.setReturnValueHandlers(this.returnValueHandlers);
        // 自定义异常处理
        await exceptionHandlerMethod.invoke(servletContext, error);
        return servletContext.isRequestHandled;
      }
    } catch (ex) {
      console.warn(`${ExceptionHandlerExceptionResolver.name} resolveException failure:`);
      console.warn(ex);
    }
    return false;
  }
}