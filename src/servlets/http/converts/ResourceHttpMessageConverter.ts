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
import HttpHeaders from '../HttpHeaders';

export default class ResourceHttpMessageConverter extends AbstractHttpMessageConverter<Resource> {

  constructor() {
    super(MediaType.ALL)
  }

  supports(clazz: Function): boolean {
    return Javascript.getClass(clazz).isEqualOrExtendOf(Resource);
  }

  async readInternal(servletContext: ServletContext) {
    const buffer = await servletContext.request.readBodyAsBuffer();
    return new ByteArrayResource(buffer);
  }

  writeInternal(resource: Resource, servletContext: ServletContext) {
    return new Promise<void>((resolve, reject) => {
      if (resource) {
        const response = servletContext.response;
        const stream = resource.getInputStream();
        response.setHeader(HttpHeaders.CONTENT_TYPE, resource.mediaType.toString());
        response.setHeader(HttpHeaders.CONTENT_LENGTH, resource.contentLength);
        stream.pipe(response.nativeResponse);
        stream.on('error', reject);
        stream.on('end', resolve);
      } else {
        resolve();
      }
    });
  }
}