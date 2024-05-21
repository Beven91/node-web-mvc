/**
 * @module ByteArrayHttpMessageConverter
 * @description 用于处理字节数组消息
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import Javascript from '../../../interface/Javascript';

export default class ByteArrayHttpMessageConverter extends AbstractHttpMessageConverter<Buffer> {

  constructor() {
    super(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL);
  }

  supports(clazz: Function): boolean {
    return Javascript.createTyper(clazz).isType(Buffer);
  }

  readInternal(servletContext: ServletContext): Promise<Buffer> {
    return servletContext.request.readBodyAsBuffer();
  }

  async writeInternal(buffer: Buffer, servletContext: ServletContext) {
    const response = servletContext.response;
    await response.fullResponse(buffer,MediaType.APPLICATION_OCTET_STREAM);
  }
}