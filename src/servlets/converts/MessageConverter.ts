/**
 * @module MessageConverter
 * @description 内容转换器
 */
import MediaType from '../MediaType';
import ServletContext from '../ServletContext';
import HttpMessageConverter from './HttpMessageConverter';
import JsonMessageConverter from './JsonMessageConverter';
import DefaultMessageConverter from './DefaultMessageConverter';

const registerConverters: Array<HttpMessageConverter> = [
  new JsonMessageConverter(),
  new DefaultMessageConverter()
]

export default class MessageConverter {

  /**
   * 注册一个消息转换器
   * @param servletContext 
   */
  static registerConverter(converter: HttpMessageConverter) {
    registerConverters.push(converter);
  }

  /**
   * 当前当前http的内容
   */
  static read(servletContext: ServletContext): Promise<any> {
    const mediaType = new MediaType(servletContext.request.headers['content-type'] || '');
    const converter = registerConverters.find((converter) => converter.canRead(mediaType));
    return Promise.resolve(converter.read(servletContext, mediaType));
  }

  /**
   * 写出内容到response中
   */
  static write(data, mediaType: MediaType, servletContext: ServletContext): Promise<any> {
    const converter = registerConverters.find((converter) => converter.canWrite(mediaType));
    return Promise.resolve(converter.write(data, mediaType, servletContext));
  }
}
