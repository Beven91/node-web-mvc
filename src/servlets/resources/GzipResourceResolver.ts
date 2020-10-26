/**
 * @module GzipResourceResolver
 * @description gzip资源解析器
 */

import ResourceResolver from './ResourceResolver';

export default class GzipResourceResolver implements ResourceResolver {

  resolveResource(request: HttpServletRequest, requestPath: string, locations, next: ResourceResolverChain): Promise<Resource> {

  }

  resolveUrlPath(resourcePath: string, locations, chain: ResourceResolverChain): Promise<string> {

  }
}