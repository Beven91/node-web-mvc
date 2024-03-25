import ControllerAdvice from "../../annotations/ControllerAdvice";
import ExceptionHandler from "../../annotations/ExceptionHandler";
import RuntimeAnnotation from "../../annotations/annotation/RuntimeAnnotation";
import ServletContext from "../../http/ServletContext";
import HandlerMethod from "../HandlerMethod";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class ExceptionHandlerExceptionResolver implements HandlerExceptionResolver {

  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error) {
    try {
      const chain = servletContext.chain;
      const handlerMethod = chain.getHandler();
      const adviceAnnotation = RuntimeAnnotation.getAnnotations(ControllerAdvice)[0];
      const globalAnnotation = RuntimeAnnotation.getAnnotation(ExceptionHandler, adviceAnnotation?.ctor);
      const scopeAnnotation = RuntimeAnnotation.getAnnotation(ExceptionHandler, handlerMethod.beanType);
      const exceptionAnnotation = scopeAnnotation || globalAnnotation;
      if (exceptionAnnotation) {
        const exceptionHandlerMethod = new HandlerMethod(exceptionAnnotation.ctor, exceptionAnnotation.method, servletContext.configurer);
        // 自定义异常处理
        await exceptionHandlerMethod.invoke(servletContext, error);
        return servletContext.isRequestHandled();
      }
    } catch (ex) {
      console.warn(`${ExceptionHandlerExceptionResolver.name} resolveException failure:`);
      console.warn(ex);
    }
    return false;
  }
}