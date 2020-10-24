/**
 * @module ResourceTransformerChain
 */

import Resource from "./Resource";
import HttpServletRequest from "../http/HttpServletRequest";
import WebAppConfigurer from '../WebAppConfigurer';
import HttpHeaders from "../http/HttpHeaders";
import GzipResource from "./GzipResource";

export default class ResourceTransformerChain {

  transform(request: HttpServletRequest, resource: Resource) {
    const configure = WebAppConfigurer.configurer
    if (!configure.resource.gzipped || !resource) {
      return resource;
    }
    const supportMimeTypes = WebAppConfigurer.configurer.resource.mimeTypes || {};
    const supportGzip = /gzip/.test(request.getHeader(HttpHeaders.ACCEPT_ENCODING) as string);
    if (!supportGzip || !resource.mediaType || !supportMimeTypes[resource.mediaType.name]) {
      return resource;
    }
    request.servletContext.response.setHeader(HttpHeaders.CONTENT_ENCODING, 'gzip');
    return new GzipResource(resource.filename);
  }
}