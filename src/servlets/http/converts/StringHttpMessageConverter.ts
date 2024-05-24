/**
 * @module StringHttpMessageConverter
 * @description 用于字符串内容
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import Javascript from '../../../interface/Javascript';

export default class StringHttpMessageConverter extends AbstractHttpMessageConverter<String> {

  constructor() {
    super(MediaType.TEXT_PLAIN, MediaType.ALL);
  }

  supports(clazz: Function): boolean {
    return Javascript.createTyper(clazz).isType(String);
  }

  async readInternal(servletContext: ServletContext): Promise<String> {
    const request = servletContext.request;
    const buffer = await request.readBodyAsBuffer();
    return buffer?.toString?.(request.mediaType.charset);
  }

  async writeInternal(data: string, servletContext: ServletContext) {
    const response = servletContext.response;
    const buffer = Buffer.from(data);
    await response.fullResponse(buffer, MediaType.TEXT_PLAIN);
  }
}