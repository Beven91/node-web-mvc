/**
 * @module GzipGlobalResolver
 * @description gzip资源解析器
 */

import HttpServletRequest from '../http/HttpServletRequest';
import Resource from './Resource';
import ResourceResolver from './ResourceResolver';
import ResourceResolverChain from './ResourceResolverChain';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import GzipResource from './GzipResource';
import GzipResourceResolver from './GzipResourceResolver';

export default class GzipGlobalResolver implements ResourceResolver {

  async resolveResource(request: HttpServletRequest, requestPath: string, locations, nextChain: ResourceResolverChain): Promise<Resource> {
    const resource = await nextChain.resolveResource(request, requestPath, locations);
    const gzipped = WebMvcConfigurationSupport.configurer.resource.gzipped;
    if (!gzipped || resource instanceof GzipResource) {
      return resource;
    }
    return new GzipResourceResolver().resolveResource(request, requestPath, locations, nextChain);

  }

  resolveUrlPath(resourcePath: string, locations, chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}