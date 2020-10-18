/**
 * @module DefaultMessageConverter
 * @description 默认处理消息内容转换器，用于垫底
 */
import HttpMessageConverter from './HttpMessageConverter';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';

export default class DefaultMessageConverter implements HttpMessageConverter {

  canRead(mediaType: MediaType) {
    return true;
  }

  canWrite(mediaType: MediaType) {
    return true;
  }

  read(servletContext: ServletContext, mediaType: MediaType): any {
    return null;
  }

  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      data = data === undefined ? '' : data;
      if (data instanceof Buffer || typeof data === 'string') {
        servletContext.response.write(data, resolve);
      } else {
        servletContext.response.write(String(data), resolve);
      }
    })
  }
}