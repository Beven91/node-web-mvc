import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import ResponseBody from "../../annotations/ResponseBody";
import HandlerMethod from "../HandlerMethod";
import ResponseEntity from "../../models/ResponseEntity";
import RequestMapping from "../../annotations/mapping/RequestMapping";
import MediaType from "../../http/MediaType";
import HttpStatus from "../../http/HttpStatus";

export default class RequestResponseBodyMethodProcessor implements HandlerMethodReturnValueHandler {

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.hasParameterAnnotation(ResponseBody)
  }

  async handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, method: HandlerMethod): Promise<void> {
    const { response } = servletContext;
    const messageConverters = servletContext.configurer.messageConverters;
    const entity = this.createResponseEntity(returnValue, method, servletContext);
    // 合并Http返回头
    Object.keys(entity.responseHeaders).forEach((key) => {
      response.setHeader(key, entity.responseHeaders[key]);
    })
    // 设置Http返回状态码
    response.setStatus(entity.responseStatus);
    // 根据对应的转换器来写出内容到客户端
    await messageConverters.write(entity.data, entity.mediaType, servletContext);
    // 结束返回流
    servletContext.response.end()
  }

  private createResponseEntity(data, handler: HandlerMethod, servletContext: ServletContext) {
    if (data instanceof ResponseEntity) {
      return data;
    }
    const { response } = servletContext;
    const { responseStatus, responseStatusReason } = handler;
    const useStatus = !(responseStatus === null || responseStatus === undefined)
    const status = useStatus ? responseStatus : 200;
    const produces = RequestMapping.getMappingInfo(handler.beanType, handler.methodName)?.produces;
    const mediaType = new MediaType(produces || response.nativeContentType || 'text/plain;charset=utf-8');
    const httpStatus = new HttpStatus(status, responseStatusReason);
    return ResponseEntity.status(httpStatus).body(data).contentType(mediaType);
  }
}