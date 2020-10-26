/**
 * @module ResourceHandlerMapping
 * @description 用于匹配静态资源处理器
 */

import AbstractHandlerMethodMapping from "../mapping/AbstractHandlerMethodMapping";
import HttpServletRequest from "../http/HttpServletRequest";
import PathMatcher from '../util/PathMatcher';
import MappingRegistration from '../mapping/registry/MappingRegistration';
import HandlerMethod from '../method/HandlerMethod'
import ResourceHandlerRegistration from './ResourceHandlerRegistration';

const runtime = {
  instance: null as ResourceHandlerMapping
}

export default class ResourceHandlerMapping extends AbstractHandlerMethodMapping<ResourceHandlerRegistration> {

  static getInstance() {
    if (!runtime.instance) {
      return runtime.instance = new ResourceHandlerMapping();
    }
    return runtime.instance;
  }

  constructor() {
    super();
    this.setDefaultHandler(null);
  }

  match(registraction: MappingRegistration<ResourceHandlerRegistration>, path: string, request: HttpServletRequest): HandlerMethod {
    const mapping = registraction.getMapping();
    const handlerMethod = registraction.getHandlerMethod();
    const pathPatterns = mapping.pathPatterns;
    const matcher = new PathMatcher();
    for (let pattern of pathPatterns) {
      const result = matcher.matchPattern(pattern, path);
      // 如果当前路由匹配成功
      if (result) {
        const resolver = new ResourceResolver(mapping);
        const resource = resolver.resolve(request);
        return resource ? handlerMethod : null;
      }
    }
  }
}
