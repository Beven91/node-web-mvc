import ResourceResolver from './ResourceResolver';

export default class PathResourceResolver implements ResourceResolver {

  resolveResource(request: HttpServletRequest, requestPath: string, locations, next: ResourceResolverChain): Promise<Resource> {

  }

  resolveUrlPath(resourcePath: string, locations, chain: ResourceResolverChain): Promise<string> {

  }
}