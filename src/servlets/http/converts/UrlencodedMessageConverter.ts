/**
 * @module UrlencodedMessageConverter
 * @description 一个用于处理http内容格式为: urlencoded的处理器
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import parser from 'body-parser';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';

export default class UrlencodedMessageConverter extends AbstractHttpMessageConverter {

  constructor(){
    super(new MediaType('application/x-www-form-urlencoded'));
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((resolve, reject) => {
      const { request, response } = servletContext;
      parser.urlencoded()(request.nativeRequest, response.nativeResponse, (err) => {
        err ? reject(err) : resolve((request.nativeRequest as any).body)
      });
    });
  }

  write(data, mediaType: MediaType, servletContext: ServletContext) {
    // 暂不实现
    return Promise.resolve();
  }
}