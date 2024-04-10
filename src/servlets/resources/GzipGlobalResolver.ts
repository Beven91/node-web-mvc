/**
 * @module GzipGlobalResolver
 * @description gzip资源解析器
 */

import HttpServletRequest from '../http/HttpServletRequest';
import Resource from './Resource';
import ResourceResolver from './ResourceResolver';
import ResourceResolverChain from './ResourceResolverChain';
import GzipResource from './GzipResource';
import GzipResourceResolver from './GzipResourceResolver';
import type { ResourceOptions } from '../config/WebAppConfigurerOptions';

export default class GzipGlobalResolver implements ResourceResolver {

  private config: ResourceOptions

  constructor(config: ResourceOptions) {
    this.config = config;
  }

  async resolveResource(request: HttpServletRequest, requestPath: string, locations, nextChain: ResourceResolverChain): Promise<Resource> {
    const resource = await nextChain.resolveResource(request, requestPath, locations);
    const gzipped = this.config.gzipped;
    if (!gzipped || resource instanceof GzipResource) {
      return resource;
    }
    return new GzipResourceResolver().resolveResource(request, requestPath, locations, nextChain);

  }

  resolveUrlPath(resourcePath: string, locations, chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}