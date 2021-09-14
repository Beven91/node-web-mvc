/**
 * @module ResourceRegionHttpMessageConverter
 */

import AbstractHttpMessageConverter from "../http/converts/AbstractHttpMessageConverter";
import HttpHeaders from "../http/HttpHeaders";
import HttpServletResponse from "../http/HttpServletResponse";
import MediaType from "../http/MediaType";
import ServletContext from "../http/ServletContext";
import ResourceRegion from "./ResourceRegion";
import HttpStatus from "../http/HttpStatus";

export default class ResourceRegionHttpMessageConverter extends AbstractHttpMessageConverter {

  constructor() {
    super(MediaType.ALL);
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    throw new Error("ResourceRegionHttpMessageConverter not support read");
  }

  async write(regions: Array<ResourceRegion>, mediaType: MediaType, servletContext: ServletContext) {
    const response = servletContext.response;
    for (let region of regions) {
      await this.writeRegion(region, servletContext.response);
    }
    response.end();
  }

  writeRegion(region: ResourceRegion, response: HttpServletResponse) {
    return new Promise((resolve, reject) => {
      const resource = region.resource;
      const start = region.position;
      let end = region.end;
      const resourceLength = resource.contentLength;
      end = Math.min(end, resourceLength - 1);
      const rangeLength = end - start + 1;
      response.setHeader(HttpHeaders.CONTENT_RANGE, `bytes ${start}-${end}/${resourceLength}`);
      response.setHeader(HttpHeaders.CONTENT_LENGTH, rangeLength);
      const stream = resource.getInputRangeStream(start, end);
      response.setStatus(HttpStatus.PARTIAL_CONTENT)
      response.nativeResponse.statusCode = 206;
      stream.pipe(response.nativeResponse);
      stream.on('end', ()=>{
        resolve({});
      });
      stream.on('error', reject);
    });
  }
}