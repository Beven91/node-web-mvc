/**
 * @module DefaultMessageConverter
 * @description 默认处理消息内容转换器，用于垫底
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';

export default class DefaultMessageConverter extends AbstractHttpMessageConverter {

  constructor() {
    super(MediaType.ALL);
  }

  read(servletContext: ServletContext, mediaType: MediaType): any {
    return null;
  }

  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      data = data === undefined ? '' : data;
      if (data instanceof Buffer || typeof data === 'string') {
        servletContext.response.end(data, undefined, resolve);
      } else {
        servletContext.response.end(String(data), undefined, resolve);
      }
    })
  }
}