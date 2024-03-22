/**
 * @module ResourceHttpMessageConverter
 * @description 用于返回文件流，以及文件下载支持
 */
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import Javascript from '../../../interface/Javascript';
import Resource from '../../resources/Resource';
import ByteArrayResource from '../../resources/ByteArrayResource';

export default class ResourceHttpMessageConverter extends AbstractHttpMessageConverter<Resource> {

  constructor() {
    super(MediaType.ALL)
  }

  supports(clazz: Function): boolean {
    return Javascript.getClass(clazz).isEqualOrExtendOf(Resource);
  }

  async readInternal(servletContext: ServletContext) {
    const buffer = await servletContext.request.readBody();
    return new ByteArrayResource(buffer);
  }

  writeInternal(resource: Resource, servletContext: ServletContext) {
    return new Promise<void>((resolve, reject) => {
      if (resource) {
        const stream = resource.getInputStream();
        stream.pipe(servletContext.response.nativeResponse);
        stream.on('error', reject);
        stream.on('end', resolve);
      } else {
        resolve();
      }
    });
  }
}