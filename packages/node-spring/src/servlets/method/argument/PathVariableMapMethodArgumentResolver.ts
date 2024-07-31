/**
 * @module PathVariableMapMethodArgumentResolver
 * @description path参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from '../MethodParameter';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';
import PathVariable from '../../annotations/params/PathVariable';

export default class PathVariableMapMethodArgumentResolver implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(PathVariable);
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const anno = parameter.getParameterAnnotation(PathVariable);
    const name = anno.value || parameter.paramName;
    return servletContext.request.pathVariables[name];
  }
}
