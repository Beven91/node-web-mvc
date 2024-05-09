import HttpHeaders from "../../http/HttpHeaders";
import HttpMethod from "../../http/HttpMethod";
import HttpRequestValidation from "../../http/HttpRequestValidation";
import HttpStatus from "../../http/HttpStatus";
import ServletContext from "../../http/ServletContext";
import MessageConverter from "../../http/converts/MessageConverter";
import HttpEntity from "../../models/HttpEntity";
import RequestEntity from "../../models/RequestEntity";
import ResponseEntity from "../../models/ResponseEntity";
import MethodParameter from "../MethodParameter";
import AbstractMessageConverterMethodProcessor from "./AbstractMessageConverterMethodProcessor";

export default class HttpEntityMethodProcessor extends AbstractMessageConverterMethodProcessor {

  constructor(messageConverters:MessageConverter) {
    super(messageConverters);
  }

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.isParamAssignableOf(ResponseEntity);
  }

  handleReturnValue(entity: ResponseEntity, returnType: MethodParameter, servletContext: ServletContext): Promise<void> {
    const response = servletContext.response;
    const headers = entity.httpHeaders;
    const responseStatus = entity.responseStatus;
    // 合并Http返回头
    Object.keys(entity.httpHeaders).forEach((key) => {
      if (key.toLowerCase() === 'vary') {
        response.addHeader(key, headers[key]);
      } else {
        response.setHeader(key, entity.httpHeaders[key]);
      }
    });
    // 设置返回头
    response.setStatus(responseStatus);
    if (HttpStatus.OK.equals(responseStatus) && this.isResourceNotModified(servletContext)) {
      return;
    } else if (HttpStatus.OK.code / 100 == 3) {
      // 重定向处理
    }
    return this.writeWithMessageConverters(entity.data, servletContext);
  }

  private isResourceNotModified(servletContext: ServletContext) {
    const { request, response } = servletContext;
    const method = request.method;
    if (method != HttpMethod.GET && method != HttpMethod.HEAD) {
      return false;
    }
    const etag = response.getHeaderValue(HttpHeaders.ETAG)?.[0];
    const lastModified = response.getLastModifiedTime();
    const validation = new HttpRequestValidation(request, response);
    response.removeHeader(HttpHeaders.LAST_MODIFIED);
    response.removeHeader(HttpHeaders.ETAG);
    return validation.checkNotModified(String(etag), lastModified);
  }

  supportsParameter(parameter: MethodParameter, servletContext: ServletContext): boolean {
    return parameter.isParamAssignableOf(RequestEntity) || parameter.parameterType === HttpEntity;
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    if (parameter.parameterType === HttpEntity) {
      return new HttpEntity(null, servletContext.request.headers);
    }
    // TODO: 由于目前ts默认编译场景下不支持泛型参数提取，所以这里type默认为Map类型
    const type = Map;
    const data = this.readWithMessageConverters(servletContext, type);
    return new RequestEntity(data, servletContext.request.headers);
  }
}