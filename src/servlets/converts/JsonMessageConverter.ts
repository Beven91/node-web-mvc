/**
 * @module JsonMessageConverter
 * @description 一个用于处理http请求json内容的处理器
 */
import HttpMessageConverter from './HttpMessageConverter';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import parser from 'body-parser';

export default class JsonMessageConverter implements HttpMessageConverter {

  canRead(mediaType: MediaType) {
    return mediaType.name === 'application/json';
  }

  canWrite(mediaType: MediaType) {
    return mediaType.name === 'application/json';
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((resolve, reject) => {
      parser.json()(servletContext.request, servletContext.response, (err) => {
        err ? reject(err) : resolve(servletContext.request.body)
      });
    });
  }

  write(data, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      const out = typeof data === 'string' ? data : JSON.stringify(data);
      servletContext.response.write(out, resolve);
    });
  }
}