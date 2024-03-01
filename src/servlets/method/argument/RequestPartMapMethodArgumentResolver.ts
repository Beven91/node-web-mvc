/**
 * @module RequestPartMapMethodArgumentResolver
 * @description part参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import WebMvcConfigurationSupport from '../../config/WebMvcConfigurationSupport';
import RequestPart from '../../annotations/params/RequestPart';

export default class RequestPartMapMethodArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestPart) || paramater.paramType == 'part'
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext): Promise<any> {
    const name = parameter.value;
    const body = await this.resolveBody(servletContext);
    if (parameter.dataType === Map) {
      return { ...body };
    }
    return body[name];
  }

  resolveBody(servletContext: ServletContext) {
    const { request } = servletContext;
    const mediaType = request.mediaType.name;
    switch (mediaType) {
      case 'multipart/form-data':
        return WebMvcConfigurationSupport.configurer.messageConverters.read(servletContext);
      default:
        return {};
    }
  }
}