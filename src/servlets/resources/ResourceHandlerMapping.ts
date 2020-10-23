/**
 * @module RequestMappingHandlerMapping
 * @description controller请求方法映射处理器
 */

import AbstractHandlerMethodMapping from "../mapping/AbstractHandlerMethodMapping";
import HttpServletRequest from "../http/HttpServletRequest";
import PathMatcher from '../util/PathMatcher';
import MappingRegistration from '../mapping/registry/MappingRegistration';
import HandlerMethod from '../method/HandlerMethod'
import InterruptModel from "../models/InterruptModel";
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
    const defaultHandler = new HandlerMethod({}, () => new InterruptModel());
    this.setDefaultHandler(defaultHandler);
  }

  match(registraction: MappingRegistration<ResourceHandlerRegistration>, path: string, request: HttpServletRequest): HandlerMethod {
    // const mapping = registraction.getMapping();
    // const handlerMethod = registraction.getHandlerMethod();
    // const pathPatterns = mapping.value;
    // const matcher = new PathMatcher();
    // for (let pattern of pathPatterns) {
    //   const result = matcher.matchPattern(pattern, path);
    //   // 如果当前路由匹配成功
    //   if (result) {
    //     handlerMethod.supportThisMethod = mapping.method[request.method];
    //     // 将匹配的路径变量值，设置到pathVariables
    //     request.pathVariables = result.params;
    //     return handlerMethod;
    //   }
    // }
  }
}
