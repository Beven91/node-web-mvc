/**
 * @module ServletContextMethodArgumentResolver
 * @description 用于解析servlet中的request参数和response参数
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import ServletRequest from '../../annotations/params/ServletRequest';
import ServletResponse from '../../annotations/params/ServletResponse';

export default class ServletContextMethodArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(ServletRequest) || paramater.hasParameterAnnotation(ServletResponse);
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    if (parameter.hasParameterAnnotation(ServletRequest)) {
      return servletContext.request;
    } else if (parameter.hasParameterAnnotation(ServletResponse)) {
      return servletContext.response;
    }
  }
}