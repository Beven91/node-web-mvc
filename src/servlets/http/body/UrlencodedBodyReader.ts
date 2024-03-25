/**
 * @module UrlencodedMessageConverter
 * @description 一个用于处理http内容格式为: urlencoded的处理器
 */
import querystring from 'querystring';
import type ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractBodyReader from './AbstractBodyReader';

export default class UrlencodedBodyReader extends AbstractBodyReader {

  constructor() {
    super(MediaType.APPLICATION_FORM_URLENCODED);
  }

  async readInternal(servletContext: ServletContext) {
    const buffer = await servletContext.request.readBodyAsBuffer();
    const body = buffer.toString('utf-8');
    return querystring.parse(body);
  }
}