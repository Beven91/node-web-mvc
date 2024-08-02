/**
 * @module UrlencodedMessageConverter
 * @description 一个用于处理http内容格式为: urlencoded的处理器
 */
import querystring from 'querystring';
import type HttpServletRequest from '../HttpServletRequest';
import MediaType from '../MediaType';
import AbstractBodyReader from './AbstractBodyReader';

export default class UrlencodedBodyReader extends AbstractBodyReader {
  constructor() {
    super(MediaType.APPLICATION_FORM_URLENCODED);
  }

  async readInternal(request: HttpServletRequest) {
    const buffer = await request.readBodyAsBuffer();
    const body = buffer.toString(request.mediaType.charset);
    return querystring.parse(body);
  }
}
