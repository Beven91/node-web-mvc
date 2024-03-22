/**
 * @module UrlencodedMessageConverter
 * @description 一个用于处理http内容格式为: urlencoded的处理器
 */
import querystring from 'querystring';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import Javascript from '../../../interface/Javascript';
import MultiValueMap from '../../util/MultiValueMap';

export default class UrlencodedMessageConverter extends AbstractHttpMessageConverter<Object> {

  constructor() {
    super(new MediaType('application/x-www-form-urlencoded'));
  }

  supports(clazz: Function): boolean {
    return true;
  }

  canWrite(clazz: Function, mediaType: MediaType): boolean {
    if (!Javascript.getClass(clazz).isEqualOrExtendOf(MultiValueMap)) {
      return false;
    }
    return super.canWrite(clazz, mediaType);
  }

  async readInternal(servletContext: ServletContext) {
    const buffer = await servletContext.request.readBody();
    const body = buffer.toString('utf-8');
    return querystring.parse(body);
  }

  writeInternal(data: Object, servletContext: ServletContext) {
    // 暂不实现
    return Promise.resolve();
  }
}