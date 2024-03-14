/**
 * @module RequestResponseBodyMethodProcessor
 * @description 解析body正文application/json类型的参数
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import RequestBody from '../../annotations/params/RequestBody';
import WebMvcConfigurationSupport from '../../config/WebMvcConfigurationSupport';

export default class RequestResponseBodyMethodProcessor implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestBody)
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    return await WebMvcConfigurationSupport.configurer.messageConverters.read(servletContext);
  }
}