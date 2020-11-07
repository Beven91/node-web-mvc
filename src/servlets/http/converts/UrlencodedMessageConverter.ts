/**
 * @module UrlencodedMessageConverter
 * @description 一个用于处理http内容格式为: urlencoded的处理器
 */
import querystring from 'querystring';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import RequestMemoryStream from '../RequestMemoryStream';

export default class UrlencodedMessageConverter extends AbstractHttpMessageConverter {

  constructor() {
    super(new MediaType('application/x-www-form-urlencoded'));
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((resolve, reject) => {
      const { request } = servletContext;
      new RequestMemoryStream(request, (chunks) => {
        try {
          const body = chunks.toString('utf8');
          const data = querystring.parse(body);
          resolve(data);
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }

  write(data, mediaType: MediaType, servletContext: ServletContext) {
    // 暂不实现
    return Promise.resolve();
  }
}