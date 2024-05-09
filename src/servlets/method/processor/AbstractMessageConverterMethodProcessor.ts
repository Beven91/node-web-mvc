import type ServletContext from "../../http/ServletContext";
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "../argument/HandlerMethodArgumentResolver";
import HandlerMethodReturnValueHandler from "../return/HandlerMethodReturnValueHandler";
import MessageConverter from "../../http/converts/MessageConverter";
import MediaType from "../../http/MediaType";
import HttpMediaTypeNotAcceptableException from "../../../errors/HttpMediaTypeNotAcceptableException";
import { PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE } from "../../mapping/HandlerMapping";

const ALL_APPLICATION_MEDIA_TYPES = [
  MediaType.ALL,
  new MediaType('application')
]

export default abstract class AbstractMessageConverterMethodProcessor implements HandlerMethodArgumentResolver, HandlerMethodReturnValueHandler {

  private readonly messageConverters: MessageConverter;

  constructor(messageConverters: MessageConverter) {
    this.messageConverters = messageConverters;
  }

  abstract supportsReturnType(returnType: MethodParameter): boolean

  abstract handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext): Promise<void>

  abstract supportsParameter(parameter: MethodParameter, servletContext: ServletContext): boolean

  abstract resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any

  writeWithMessageConverters<T = any>(data: T, servletContext: ServletContext) {
    const mediaType = this.selectMediaType(servletContext, data);
    return this.messageConverters.write(data, mediaType, servletContext);
  }

  readWithMessageConverters(servletContext: ServletContext, dataType: Function) {
    return this.messageConverters.read(servletContext, dataType);
  }

  private getProducibleMediaTypes(servletContext: ServletContext, data: any) {
    const configMediaTypes = servletContext.request.getAttribute<MediaType[]>(PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE);
    if (configMediaTypes.length > 0) {
      return configMediaTypes;
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

  private selectMediaType(servletContext: ServletContext, data: any) {
    const accept = servletContext.request.headers['accept'] || '';
    const requestedTypes = accept.split(',').map((type) => new MediaType(type));
    const dataType = data?.constructor;
    const producibleTypes = this.getProducibleMediaTypes(servletContext, dataType);
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