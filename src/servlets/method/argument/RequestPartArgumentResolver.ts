import MultipartException from '../../../errors/MultipartException';
import RequestPart from '../../annotations/params/RequestPart';
import HttpHeaders from '../../http/HttpHeaders';
import ServletContext from '../../http/ServletContext';
import MethodParameter from '../MethodParameter';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';

export default class RequestPartArgumentResolver implements HandlerMethodArgumentResolver {
  supportsParameter(parameter: MethodParameter, servletContext: ServletContext): boolean {
    return parameter.hasParameterAnnotation(RequestPart);
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    const request = servletContext.request;
    const anno = parameter.getParameterAnnotation(RequestPart);
    const contentType = request.getHeaderSingleValue(HttpHeaders.CONTENT_TYPE);
    if (contentType.indexOf('multipart/') < 0) {
      throw new MultipartException(`the request doesn't contain a multipart/form-data or multipart/mixed stream `);
    }
    const name = anno.value || parameter.paramName;
    const body = await request.bodyReader.read(servletContext);
    return body[name];
  }
}
