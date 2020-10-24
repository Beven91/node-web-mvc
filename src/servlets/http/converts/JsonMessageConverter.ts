/**
 * @module JsonMessageConverter
 * @description 一个用于处理http请求格式json的处理器
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import parser from 'body-parser';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';

export default class JsonMessageConverter extends AbstractHttpMessageConverter {

  constructor(){
    super(new MediaType('application/json'))
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((resolve, reject) => {
      const { request, response, configurer } = servletContext;
      parser.json()(request.nativeRequest, response.nativeResponse, (err) => {
        err ? reject(err) : resolve((request.nativeRequest as any).body)
      });
    });
  }

  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      const out = typeof data === 'string' ? data : JSON.stringify(data);
      servletContext.response.write(out, resolve);
    });
  }
}