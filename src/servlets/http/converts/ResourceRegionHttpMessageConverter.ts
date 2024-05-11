/**
 * @module ResourceRegionHttpMessageConverter
 */

import AbstractHttpMessageConverter from "./AbstractHttpMessageConverter";
import HttpHeaders from "../HttpHeaders";
import HttpStatus from "../HttpStatus";
import ResourceRegion from "../../resources/ResourceRegion";
import ServletContext from "../ServletContext";
import MediaType from "../MediaType";
import HttpServletResponse from "../HttpServletResponse";
import Javascript from "../../../interface/Javascript";
import RegionsResource from "../../resources/RegionsResource";

export default class ResourceRegionHttpMessageConverter extends AbstractHttpMessageConverter<RegionsResource> {

  constructor() {
    super(MediaType.ALL);
  }

  supports(clazz: Function): boolean {
    return Javascript.getClass(clazz).isEqualOrExtendOf(RegionsResource);
  }

  async readInternal(servletContext: ServletContext): Promise<any> {
    throw new Error("ResourceRegionHttpMessageConverter not support read");
  }

  async writeInternal(resource: RegionsResource, servletContext: ServletContext) {
    const regions = resource.regions;
    const response = servletContext.response;
    for (let region of regions) {
      await this.writeRegion(region, servletContext.response);
    }
    return response.end();
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
      stream.on('end', () => {
        resolve({});
      });
      stream.on('error', reject);
    });
  }
}