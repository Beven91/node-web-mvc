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
import GzipResource from '../../resources/GzipResource';

export default class ResourceHttpMessageConverter extends AbstractHttpMessageConverter<Resource> {

  constructor() {
    super(MediaType.ALL)
  }

  supports(clazz: Function): boolean {
    return Javascript.createTyper(clazz).isType(Resource);
  }

  async readInternal(servletContext: ServletContext) {
    const buffer = await servletContext.request.readBodyAsBuffer();
    return new ByteArrayResource(buffer);
  }

  async writeInternal(resource: Resource, servletContext: ServletContext) {
    if (!resource) {
      return;
    }
    const response = servletContext.response;
    if (resource.mediaType) {
      response.setHeader(HttpHeaders.CONTENT_TYPE, resource.mediaType.toString());
    }
    if (!(resource instanceof GzipResource)) {
      // 由于gzip下，默认不希望将整个返回内容加载到内存，采用流式返回（且因为该方案无法获取压缩后大小，所以不设置content-length)
      response.setHeader(HttpHeaders.CONTENT_LENGTH, resource.contentLength);
    } else {
      response.setHeader(HttpHeaders.TRANSFER_ENCODING, 'chunked');
    }
    await resource.pipe(response.nativeResponse);
  }
}