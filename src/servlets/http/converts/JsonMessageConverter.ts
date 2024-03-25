/**
 * @module JsonMessageConverter
 * @description 一个用于处理http请求格式json的处理器
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';

export default class JsonMessageConverter extends AbstractHttpMessageConverter<Object> {

  constructor() {
    super(MediaType.APPLICATION_JSON, new MediaType('application', '*+json'))
  }

  supports(clazz: Function): boolean {
    return true;
  }

  async readInternal(servletContext: ServletContext) {
    if (!servletContext.request.hasBody) {
      return null;
    }
    const buffer = await servletContext.request.readBodyAsBuffer();
    const body = buffer.toString('utf8');
    return JSON.parse(body);
  }

  writeInternal(data: Object, servletContext: ServletContext) {
    return new Promise<void>((resolve) => {
      const out = typeof data === 'string' ? data : JSON.stringify(data);
      servletContext.response.end(out, undefined, resolve);
    });
  }
}