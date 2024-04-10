/**
 * @module GzipResourceResolver
 * @description gzip资源解析器
 */

import HttpServletRequest from '../http/HttpServletRequest';
import Resource from './Resource';
import ResourceResolver from './ResourceResolver';
import ResourceResolverChain from './ResourceResolverChain';
import HttpHeaders from '../http/HttpHeaders';
import GzipResource from './GzipResource';

export default class GzipResourceResolver implements ResourceResolver {

  async resolveResource(request: HttpServletRequest, requestPath: string, locations, nextChain: ResourceResolverChain): Promise<Resource> {
    const resource = await nextChain.resolveResource(request, requestPath, locations);
    const isGzipAccepted = /gzip/.test(request.getHeader(HttpHeaders.ACCEPT_ENCODING) as string);
    if (resource && isGzipAccepted) {
      return new GzipResource(resource.url);
    }
    return resource;

  }

  resolveUrlPath(resourcePath: string, locations, chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}