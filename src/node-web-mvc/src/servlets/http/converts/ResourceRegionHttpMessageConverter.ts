/**
 * @module ResourceRegionHttpMessageConverter
 */

import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';
import HttpHeaders from '../HttpHeaders';
import HttpStatus from '../HttpStatus';
import ResourceRegion from '../../resources/ResourceRegion';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import HttpServletResponse from '../HttpServletResponse';
import Javascript from '../../../interface/Javascript';
import RegionsResource from '../../resources/RegionsResource';
import GzipResource from '../../resources/GzipResource';

export default class ResourceRegionHttpMessageConverter extends AbstractHttpMessageConverter<RegionsResource> {
  constructor() {
    super(MediaType.ALL);
  }

  supports(clazz: Function): boolean {
    return Javascript.createTyper(clazz).isType(RegionsResource);
  }

  async readInternal(servletContext: ServletContext): Promise<any> {
    throw new Error('ResourceRegionHttpMessageConverter not support read');
  }

  async writeInternal(resource: RegionsResource, servletContext: ServletContext) {
    const regions = resource.regions;
    const response = servletContext.response;
    for (const region of regions) {
      await this.writeRegion(region, servletContext.response);
    }
    return response.end();
  }

  async writeRegion(region: ResourceRegion, response: HttpServletResponse) {
    if (!region?.resource) {
      return;
    }
    const resource = region.resource;
    const start = region.position;
    let end = region.end;
    const resourceLength = resource.contentLength;
    end = Math.min(end, resourceLength - 1);
    const rangeLength = end - start + 1;
    const nativeResponse = response.nativeResponse;
    response.setHeader(HttpHeaders.CONTENT_RANGE, `bytes ${start}-${end}/${resourceLength}`);
    if (!(resource instanceof GzipResource)) {
      // gzip下不返回content-length
      response.setHeader(HttpHeaders.CONTENT_LENGTH, rangeLength);
    } else {
      response.setHeader(HttpHeaders.TRANSFER_ENCODING, 'chunked');
    }
    response.setStatus(HttpStatus.PARTIAL_CONTENT);
    response.nativeResponse.statusCode = 206;
    await resource.pipe(nativeResponse, start, end);
  }
}
