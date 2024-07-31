import { BeanFactory } from '../../../ioc/factory/BeanFactory';
import ControllerAdvice from '../../annotations/ControllerAdvice';
import ExceptionHandler from '../../annotations/ExceptionHandler';
import RuntimeAnnotation from '../../annotations/annotation/RuntimeAnnotation';
import ServletContext from '../../http/ServletContext';
import ModelAndView from '../../models/ModelAndView';
import ModelAndViewContainer from '../../models/ModelAndViewContainer';
import HandlerMethod from '../HandlerMethod';
import ServletInvocableHandlerMethod from '../ServletInvocableHandlerMethod';
import HandlerMethodReturnValueHandler from '../return/HandlerMethodReturnValueHandler';
import HandlerExceptionResolver from './HandlerExceptionResolver';

export default class ExceptionHandlerExceptionResolver implements HandlerExceptionResolver {
  private readonly beanFactory: BeanFactory;

  private readonly returnValueHandlers: HandlerMethodReturnValueHandler[];

  constructor(returnValueHandlers: HandlerMethodReturnValueHandler[], beanFactory: BeanFactory) {
    this.returnValueHandlers = returnValueHandlers;
    this.beanFactory = beanFactory;
  }

  async resolveException(servletContext: ServletContext, handlerMethod: HandlerMethod, error: Error) {
    try {
      const mavContainer = new ModelAndViewContainer();
      const adviceAnnotation = RuntimeAnnotation.getAnnotation(ControllerAdvice);
      const globalAnnotation = RuntimeAnnotation.getAnnotation(ExceptionHandler, adviceAnnotation?.ctor);
      const scopeAnnotation = RuntimeAnnotation.getAnnotation(ExceptionHandler, handlerMethod?.beanType);
      const exceptionAnnotation = scopeAnnotation || globalAnnotation;
      if (exceptionAnnotation) {
        const bean = this.beanFactory.getBean(exceptionAnnotation.ctor);
        const handlerMethod = new HandlerMethod(bean, exceptionAnnotation.method, this.beanFactory);
        const exceptionHandlerMethod = new ServletInvocableHandlerMethod(handlerMethod);
        exceptionHandlerMethod.setReturnValueHandlers(this.returnValueHandlers);
        // 自定义异常处理
        await exceptionHandlerMethod.invoke(servletContext, mavContainer, [ error ]);

        if (mavContainer.requestHandled) {
          // 如果请求已处理
          return new ModelAndView();
        }
        return new ModelAndView(mavContainer.view, mavContainer.model, mavContainer.status);
      }
    } catch (ex) {
      console.warn(`${ExceptionHandlerExceptionResolver.name} resolveException failure:`);
      console.warn(ex);
    }

    return null;
  }
}
