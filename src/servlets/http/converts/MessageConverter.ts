/**
 * @module MessageConverter
 * @description 内容转换器
 */
import MediaType from '../MediaType';
import ServletContext from '../ServletContext';
import HttpMessageConverter from './HttpMessageConverter';
import JsonMessageConverter from './JsonMessageConverter';
import DefaultMessageConverter from './DefaultMessageConverter';
import MultipartMessageConverter from './MultipartMessageConverter';
import UrlencodedMessageConverter from './UrlencodedMessageConverter';
import EntityTooLargeError from '../../../errors/EntityTooLargeError';

const registerConverters: Array<HttpMessageConverter> = [
  new JsonMessageConverter(),
  new UrlencodedMessageConverter(),
  new MultipartMessageConverter(),
  new DefaultMessageConverter()
]

export default class MessageConverter {

  /**
   * 注册一个消息转换器
   * @param servletContext 
   */
  static addMessageConverters(converter: HttpMessageConverter) {
    registerConverters.push(converter);
  }

  /**
   * 当前当前http的内容
   */
  static read(servletContext: ServletContext): Promise<any> {
    const request = servletContext.request;
    const configurer = servletContext.configurer;
    const length = parseFloat(request.headers['content-length']);
    if (length > configurer.multipart.maxRequestSize) {
      // 如果请求超出限制
      return Promise.reject(new EntityTooLargeError());
    }
    if (request.body) {
      // 如果body已经读取，或者正在读取中
      return Promise.resolve(request.body);
    }
    const mediaType = servletContext.request.mediaType;
    const converter = registerConverters.find((converter) => converter.canRead(mediaType));
    return request.body = Promise.resolve(converter.read(servletContext, mediaType));
  }

  /**
   * 写出内容到response中
   */
  static write(data, mediaType: MediaType, servletContext: ServletContext): Promise<any> {
    const converter = registerConverters.find((converter) => converter.canWrite(mediaType));
    return Promise.resolve(converter.write(data, mediaType, servletContext));
  }
}
