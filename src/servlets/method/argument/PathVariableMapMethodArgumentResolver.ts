/**
 * @module PathVariableMapMethodArgumentResolver
 * @description path参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";

export default class PathVariableMapMethodArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.paramType === 'path';
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    return servletContext.request.pathVariables[parameter.value];
  }
}