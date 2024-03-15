/**
 * @module RequestParamMapMethodArgumentResolver
 * @description urlencode参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import RequestParam from '../../annotations/params/RequestParam';
import RequestPart from '../../annotations/params/RequestPart';
import MultipartFile from '../../http/MultipartFile';

export default class RequestParamMapMethodArgumentResolver implements HandlerMethodArgumentResolver {

  private readonly useDefaultResolution: boolean;

  constructor(useDefaultResolution?: boolean) {
    this.useDefaultResolution = !!useDefaultResolution;
  }

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    if (paramater.hasParameterAnnotation(RequestParam) || paramater.hasParameterAnnotation(RequestPart)) {
      return true;
    } else if (paramater.isParamAssignableOf(MultipartFile)) {
      return true;
    } else {
      return this.useDefaultResolution;
    }
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext): Promise<any> {
    const anno = parameter.getParameterAnnotation(RequestParam);
    const { request } = servletContext;
    const name = anno.value || parameter.paramName;
    const query = request.query;
    const body = await this.resolveBody(servletContext);
    if (parameter.isParamAssignableOf(Map)) {
      return { ...query, ...body };
    }
    return name in query ? query[name] : body[name];
  }

  resolveBody(servletContext: ServletContext) {
    const { request } = servletContext;
    const mediaType = request.mediaType.name;
    switch (mediaType) {
      case 'multipart/form-data':
      case 'application/x-www-form-urlencoded':
        return servletContext.configurer.messageConverters.read(servletContext);
      default:
        return {};
    }
  }
}