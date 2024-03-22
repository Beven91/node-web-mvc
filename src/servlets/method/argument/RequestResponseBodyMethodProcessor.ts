/**
 * @module RequestResponseBodyMethodProcessor
 * @description 解析body正文application/json类型的参数
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import RequestBody from '../../annotations/params/RequestBody';

export default class RequestResponseBodyMethodProcessor implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestBody)
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    return await servletContext.configurer.messageConverters.read(servletContext, parameter.parameterType);
  }
}