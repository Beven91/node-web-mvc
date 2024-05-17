/**
 * @module MessageConverter
 * @description 内容转换器
 */
import MediaType from '../MediaType';
import ServletContext from '../ServletContext';
import HttpMessageConverter from './HttpMessageConverter';

export default class MessageConverter {

  private readonly registerConverters: Array<HttpMessageConverter<any>>

  constructor() {
    this.registerConverters = []
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
  read(servletContext: ServletContext, dataType: Function): Promise<any> {
    const mediaType = servletContext.request.mediaType;
    const converter = this.registerConverters.find((converter) => converter.canRead(dataType, mediaType));
    return Promise.resolve(converter.read(servletContext, dataType));
  }

  /**
   * 写出内容到response中
   */
  write(body: any, mediaType: MediaType, servletContext: ServletContext): Promise<any> {
    return new Promise((resolve) => {
      Promise.resolve(body).then((data) => {
        const dataType = body?.constructor;
        const converter = this.registerConverters.find((converter) => converter.canWrite(dataType, mediaType));
        return resolve(converter.write(data, servletContext));
      })
    })
  }
}