import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import ResponseBody from "../../annotations/ResponseBody";
import HandlerMethod from "../HandlerMethod";
import ResponseEntity from "../../models/ResponseEntity";
import RequestMapping from "../../annotations/mapping/RequestMapping";
import MediaType from "../../http/MediaType";
import HttpStatus from "../../http/HttpStatus";
import HttpMediaTypeNotAcceptableException from "../../../errors/HttpMediaTypeNotAcceptableException";
import RequestBody from "../../annotations/params/RequestBody";
import HandlerMethodReturnValueHandler from "../return/HandlerMethodReturnValueHandler";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import MessageConverter from "../../http/converts/MessageConverter";

const ALL_APPLICATION_MEDIA_TYPES = [
  MediaType.ALL,
  new MediaType('application')
]

export default class RequestResponseBodyMethodProcessor implements HandlerMethodReturnValueHandler, HandlerMethodArgumentResolver {

  private readonly messageConverters: MessageConverter;

  constructor(messageConverters: MessageConverter) {
    this.messageConverters = messageConverters;
  }

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.hasClassAnnotation(ResponseBody) || returnType.hasMethodAnnotation(ResponseBody);
  }

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestBody)
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    return await this.messageConverters.read(servletContext, parameter.parameterType);
  }

  private hasValue(returnValue: any) {
    return (returnValue !== null) && returnValue !== '' && returnValue !== undefined;
  }

  async handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, method: HandlerMethod): Promise<void> {
    if (this.hasValue(returnValue)) {
      const { response } = servletContext;
      const messageConverters = this.messageConverters;
      const entity = await this.createResponseEntity(returnValue, method, servletContext);
      // 合并Http返回头
      Object.keys(entity.responseHeaders).forEach((key) => {
        response.setHeader(key, entity.responseHeaders[key]);
      })
      // 设置Http返回状态码
      response.setStatus(entity.responseStatus);
      // 根据对应的转换器来写出内容到客户端
      await messageConverters.write(entity.data, entity.mediaType, servletContext);
    } else {
      servletContext.response.setStatus(HttpStatus.OK);
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
    const produces = RequestMapping.getMappingInfo(handler.beanType, handler.methodName)?.produces || [];
    if (produces.length > 0) {
      return produces.map((m) => new MediaType(m));
    }
    const mediaTypes: MediaType[] = [];
    const messageConverters = this.messageConverters;
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
    const dataType = data?.constructor;
    const producibleTypes = this.getProducibleMediaTypes(servletContext, handler, dataType);
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