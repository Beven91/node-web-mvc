import Javascript from "../../../interface/Javascript";
import Component from "../../../ioc/annotations/Component";
import RuntimeAnnotation from "../../annotations/annotation/RuntimeAnnotation";
import WebMvcConfigurationSupport from "../../config/WebMvcConfigurationSupport";
import ServletContext from "../../http/ServletContext";
import MethodParameter from "../../method/MethodParameter";
import ModelAndViewMethodReturnValueHandler from "../../method/return/ModelAndViewMethodReturnValueHandler";
import ModelAndView from "../../models/ModelAndView";
import DefaultErrorAttributes from "./DefaultErrorAttributes";
import ErrorAttributes from "./ErrorAttributes";

export default class InternalErrorHandler {

  private readonly errorAttributes: ErrorAttributes;

  constructor(configurer: WebMvcConfigurationSupport) {
    const isExtendErrorAttributes = (m: RuntimeAnnotation) => Javascript.getClass(m.ctor).isEqualOrExtendOf(ErrorAttributes);
    const MyErrorAttributes = RuntimeAnnotation.getAnnotations(Component).find(isExtendErrorAttributes)?.ctor;
    if (MyErrorAttributes) {
      this.errorAttributes = configurer.beanFactory.getBeanOfType(MyErrorAttributes);
    } else {
      this.errorAttributes = new DefaultErrorAttributes();
    }
  }

  async resolveException(servletContext: ServletContext): Promise<any> {
    const accept = servletContext.request.getHeaderValue('accept').join(',')
    const acceptHtml = accept.toLowerCase().indexOf("text/html") > -1;
    return acceptHtml ? this.handleErrorHtml(servletContext) : this.handleError(servletContext);
  }

  handleError(servletContext: ServletContext) {
    const response = servletContext.response;
    const data = this.errorAttributes.getErrorAttributes(servletContext);
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(data));
  }

  handleErrorHtml(servletContext: ServletContext) {
    const handler = new ModelAndViewMethodReturnValueHandler();
    const data = this.errorAttributes.getErrorAttributes(servletContext);
    const mv = new ModelAndView("error", data);
    const returnType = new MethodParameter(InternalErrorHandler, "handleErrorHtml", "", -1, mv.constructor);
    return handler.handleReturnValue(mv, returnType, servletContext);
  }
}