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
    return Javascript.getClass(clazz).isEqualOrExtendOf(String);
  }

  async readInternal(servletContext: ServletContext): Promise<String> {
    const buffer = await servletContext.request.readBodyAsBuffer();
    return buffer?.toString?.('utf-8');
  }

  async writeInternal(data: string, servletContext: ServletContext) {
    servletContext.response.end(data, undefined);
  }
}