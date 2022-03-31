/**
 * @module JsonMessageConverter
 * @description 一个用于处理http请求格式json的处理器
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import RequestMemoryStream from '../RequestMemoryStream';
import HttpMethod from '../HttpMethod';

export default class JsonMessageConverter extends AbstractHttpMessageConverter {

  constructor() {
    super(new MediaType('application/json'))
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    if (!servletContext.request.hasBody) {
      return null;
    }
    return new Promise((resolve, reject) => {
      const { request } = servletContext;
      new RequestMemoryStream(request, (chunks) => {
        try {
          const body = chunks.toString('utf8');
          const data = JSON.parse(body);
          resolve(data);
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }

  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      const out = typeof data === 'string' ? data : JSON.stringify(data);
      servletContext.response.end(out, undefined, resolve);
    });
  }
}