import HttpServletRequest from '../http/HttpServletRequest';
import Resource from './Resource';
import ResourceResolver from './ResourceResolver';
import ResourceResolverChain from './ResourceResolverChain';

export default class PathResourceResolver implements ResourceResolver {

  async resolveResource(request: HttpServletRequest, requestPath: string, locations: Array<Resource>, nextChain: ResourceResolverChain): Promise<Resource> {
    return this.getResource(requestPath, locations);
  }

  async resolveUrlPath(resourcePath: string, locations: Array<Resource>, chain: ResourceResolverChain): Promise<string> {
    const resource = this.getResource(resourcePath, locations);
    return resource ? resource.url : null;
  }

  private getResource(resourcePath, locations): Resource {
    for (let location of locations) {
      const resource = location.createRelative(resourcePath);
      if (resource.isReadable) {
        return resource;
      }
    }
    return null;
  }
}