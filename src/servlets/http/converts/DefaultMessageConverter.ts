/**
 * @module DefaultMessageConverter
 * @description 默认处理消息内容转换器，用于垫底
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';

export default class DefaultMessageConverter extends AbstractHttpMessageConverter<any> {
  constructor() {
    super(MediaType.ALL);
  }

  supports(clazz: Function): boolean {
    return true;
  }

  async readInternal(servletContext: ServletContext): Promise<any> {
    const request = servletContext.request;
    const buffer = await request.readBodyAsBuffer();
    return buffer.toString(request.mediaType.charset);
  }

  async writeInternal(data: any, servletContext: ServletContext) {
    const response = servletContext.response;
    await response.fullResponse(data, MediaType.APPLICATION_OCTET_STREAM);
  }
}
