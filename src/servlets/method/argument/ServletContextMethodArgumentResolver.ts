/**
 * @module ServletContextMethodArgumentResolver
 * @description 用于解析servlet中的request参数和response参数
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";

export default class PathVariableMapMethodArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.paramType === 'request' || paramater.paramType === 'response';
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    switch (parameter.paramType) {
      case 'request':
        return servletContext.request;
      case 'response':
        return servletContext.response;
      case 'next':
        return servletContext.next;
      default:
        return null;
    }
  }
}