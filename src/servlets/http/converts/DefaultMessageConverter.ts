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

  read(servletContext: ServletContext, mediaType: MediaType) {
    return null;
  }

  write(data, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      if (data instanceof Buffer || typeof data === 'string') {
        servletContext.response.write(data, resolve);
      } else {
        servletContext.response.write(JSON.stringify(data), resolve);
      }
    })
  }
}