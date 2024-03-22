import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import ResponseBody from "../../annotations/ResponseBody";
import HandlerMethod from "../HandlerMethod";
import ResponseEntity from "../../models/ResponseEntity";
import RequestMapping from "../../annotations/mapping/RequestMapping";
import MediaType from "../../http/MediaType";
import HttpStatus from "../../http/HttpStatus";
import HttpMediaTypeNotAcceptableException from "../../../errors/HttpMediaTypeNotAcceptableException";

const ALL_APPLICATION_MEDIA_TYPES = [
  MediaType.ALL,
  new MediaType('application')
]

export default class RequestResponseBodyMethodProcessor implements HandlerMethodReturnValueHandler {

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.hasClassAnnotation(ResponseBody) || returnType.hasParameterAnnotation(ResponseBody);
  }

  private hasValue(returnValue: any) {
    return (returnValue !== null) && returnValue !== '' && returnValue !== undefined;
  }

  async handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, method: HandlerMethod): Promise<void> {
    if (this.hasValue(returnValue)) {
      const { response } = servletContext;
      const messageConverters = servletContext.configurer.messageConverters;
      const entity = await this.createResponseEntity(returnValue, method, servletContext);
      // 合并Http返回头
      Object.keys(entity.responseHeaders).forEach((key) => {
        response.setHeader(key, entity.responseHeaders[key]);
      })
      // 设置Http返回状态码
      response.setStatus(entity.responseStatus);
      // 根据对应的转换器来写出内容到客户端
      await messageConverters.write(entity.data, entity.mediaType, servletContext);
    }
    // 结束返回流
    servletContext.response.end()
  }

  private createResponseEntity(data, handler: HandlerMethod, servletContext: ServletContext) {
    if (data instanceof ResponseEntity) {
      return data;
    }
    const status = HttpStatus.OK;
    const mediaType = this.selectMediaType(servletContext, handler, data);
    return ResponseEntity.status(status).body(data).contentType(mediaType);
  }

  private getProducibleMediaTypes(servletContext: ServletContext, handler: HandlerMethod, data: any) {
    const produces = RequestMapping.getMappingInfo(handler.beanType, handler.methodName)?.produces;
    if (produces.length > 0) {
      return produces.map((m) => new MediaType(m));
    }
    const mediaTypes: MediaType[] = [];
    const messageConverters = servletContext.configurer.messageConverters;
    messageConverters.forEach((converter) => {
      if (converter.canWrite(data, null)) {
        mediaTypes.push(...converter.getSupportedMediaTypes());
      }
    });
    return mediaTypes;
  }

  private getMostSpecifiMediaType(requestType: MediaType, producibleType: MediaType) {
    const mediaType = producibleType.copyQualityValue(requestType);
    return MediaType.specificityCompare(requestType, mediaType) <= 0 ? requestType : mediaType;
  }

  private selectMediaType(servletContext: ServletContext, handler: HandlerMethod, data: any) {
    const requestedTypes = (servletContext.request.headers['accept']).split(',').map((type) => new MediaType(type));
    const producibleTypes = this.getProducibleMediaTypes(servletContext, handler, data);
    const mediaTypesToUse: MediaType[] = [];
    for (let requestType of requestedTypes) {
      for (let producibleType of producibleTypes) {
        if (requestType.isCompatibleWith(producibleType)) {
          mediaTypesToUse.push(this.getMostSpecifiMediaType(requestType, producibleType));
        }
      }
    }
    if (mediaTypesToUse.length < 1) {
      throw new HttpMediaTypeNotAcceptableException(producibleTypes);
    }
    return mediaTypesToUse.find((m) => m.isConcrete || m.isPresentIn(ALL_APPLICATION_MEDIA_TYPES)) || MediaType.ALL;
  }
}