/**
 * @module RequestParamMapMethodArgumentResolver
 * @description urlencode参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import RequestParam from '../../annotations/params/RequestParam';
import MultipartFile from '../../http/MultipartFile';
import { isMultipartFiles } from '../../util/ApiUtils';

export default class RequestParamMapMethodArgumentResolver implements HandlerMethodArgumentResolver {

  private readonly useDefaultResolution: boolean;

  constructor(useDefaultResolution?: boolean) {
    this.useDefaultResolution = !!useDefaultResolution;
  }

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    if (paramater.hasParameterAnnotation(RequestParam)) {
      return true;
    } else if (paramater.isParamAssignableOf(MultipartFile)) {
      return true;
    } else {
      return this.useDefaultResolution;
    }
  }

  async resolveMultipartFile(name: string, servletContext: ServletContext) {
    const body = await servletContext.request.bodyReader.read(servletContext);
    const value = body[name];
    if (isMultipartFiles(value)) {
      return value;
    }
    return null;
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext): Promise<any> {
    const anno = parameter.getParameterAnnotation(RequestParam);
    const { request } = servletContext;
    const name = anno?.value || parameter.paramName;
    const query = request.query;
    // TODO :需要识别泛型 MultipartFile[]
    if (parameter.isParamAssignableOf(MultipartFile)) {
      return this.resolveMultipartFile(name, servletContext);
    } else if (parameter.isParamAssignableOf(Map)) {
      return { ...query };
    }
    return query[name];
  }
}