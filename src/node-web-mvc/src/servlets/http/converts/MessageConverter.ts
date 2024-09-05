/**
 * @module MessageConverter
 * @description 内容转换器
 */
import HttpMediaTypeNotSupportedException from '../../../errors/HttpMediaTypeNotSupportedException';
import HttpMethod from '../HttpMethod';
import MediaType from '../MediaType';
import ServletContext from '../ServletContext';
import HttpMessageConverter from './HttpMessageConverter';

const NO_VALUE = {};

const SUPPORTED_METHODS = new Set([
  HttpMethod.POST,
  HttpMethod.PUT,
  HttpMethod.PATCH,
]);

export default class MessageConverter {
  private readonly registerConverters: Array<HttpMessageConverter<any>>;

  constructor() {
    this.registerConverters = [];
  }

  /**
   * 注册一个消息转换器
   * @param servletContext
   */
  addMessageConverters(...converter: HttpMessageConverter<any>[]) {
    this.registerConverters.push(...converter);
  }

  forEach(handler: (converter: HttpMessageConverter) => void) {
    return this.registerConverters.forEach(handler);
  }

  /**
   * 当前当前http的内容
   */
  async read(servletContext: ServletContext, dataType: Function) {
    const request = servletContext.request;
    const mediaType = request.mediaType;
    const httpMethod = request.method;
    const converter = this.registerConverters.find((converter) => converter.canRead(dataType, mediaType));
    let body = NO_VALUE;
    if (converter) {
      body = await converter.read(servletContext, dataType);
    }
    if (body !== NO_VALUE) {
      return body;
    }
    if (!httpMethod || !SUPPORTED_METHODS.has(httpMethod) || (mediaType.isEmpty() && request.nativeRequest.readableLength < 1)) {
      return null;
    }
    throw new HttpMediaTypeNotSupportedException(mediaType);
  }

  /**
   * 写出内容到response中
   */
  async write(body: any, mediaType: MediaType, servletContext: ServletContext): Promise<any> {
    const data = await Promise.resolve(body);
    const dataType = data?.constructor;
    const converter = this.registerConverters.find((converter) => converter.canWrite(dataType, mediaType));
    return converter.write(data, servletContext);
  }
}
