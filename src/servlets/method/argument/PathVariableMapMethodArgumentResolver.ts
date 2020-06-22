/**
 * @module PathVariableMapMethodArgumentResolver
 * @description path参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import PathVariable from '../../annotations/params/PathVariable';

export default class PathVariableMapMethodArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(PathVariable)
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    return servletContext.request.pathVariables[parameter.value];
  }
}