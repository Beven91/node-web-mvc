import path from 'path';
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

  private getResource(resourcePath: string, locations: Array<Resource>): Resource {
    const segments = (resourcePath).split('/');
    const first = segments.shift();
    for (let location of locations) {
      const resource = location.createRelative(resourcePath);
      if (resource.isReadable) {
        return resource;
      } else if (location.url.endsWith(path.sep + first + path.sep)) {
        const resource2 = location.createRelative(segments.join('/'));
        return resource2.isReadable ? resource2 : null;
      }
    }
    return null;
  }
}