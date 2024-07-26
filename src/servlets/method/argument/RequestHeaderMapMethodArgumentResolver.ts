/**
 * @module RequestHeaderMapMethodArgumentResolver
 * @description 请求头参数参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from '../MethodParameter';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';
import RequestHeader from '../../annotations/params/RequestHeader';

export default class RequestHeaderMapMethodArgumentResolver implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestHeader);
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const anno = parameter.getParameterAnnotation(RequestHeader);
    const name = anno.value || parameter.paramName;
    return servletContext.request.headers[name];
  }
}
