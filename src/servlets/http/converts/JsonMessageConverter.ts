/**
 * @module JsonMessageConverter
 * @description 一个用于处理http请求格式json的处理器
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import Serialization from '../../../serialization/Serialization';

export default class JsonMessageConverter extends AbstractHttpMessageConverter<Object> {
  constructor() {
    super(MediaType.APPLICATION_JSON, new MediaType('application', '*+json'));
  }

  supports(clazz: Function): boolean {
    return true;
  }

  async readInternal(servletContext: ServletContext, dataType: Function) {
    if (!servletContext.request.hasBody) {
      return null;
    }
    const buffer = await servletContext.request.readBodyAsBuffer();
    const body = buffer.toString('utf8');
    return JSON.parse(body);
  }

  async writeInternal(data: object, servletContext: ServletContext) {
    const serialization = new Serialization();
    const out = typeof data === 'string' ? data : serialization.serialize(data);
    const response = servletContext.response;
    await response.fullResponse(out, MediaType.APPLICATION_JSON);
  }
}
