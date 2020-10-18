/**
 * @module RequestMappingHandlerMapping
 * @description controller请求方法映射处理器
 */

import AbstractHandlerMethodMapping from "./AbstractHandlerMethodMapping";
import RequestMappingInfo from './RequestMappingInfo';
import HttpServletRequest from "../http/HttpServletRequest";
import PathMatcher from '../util/PathMatcher';
import MappingRegistration from '../mapping/registry/MappingRegistration';
import HandlerMethod from '../method/HandlerMethod'
import InterruptModel from "../models/InterruptModel";

const runtime = {
  instance: null as RequestMappingHandlerMapping
}

export default class RequestMappingHandlerMapping extends AbstractHandlerMethodMapping<RequestMappingInfo> {

  static getInstance() {
    if (!runtime.instance) {
      return runtime.instance = new RequestMappingHandlerMapping();
    }
    return runtime.instance;
  }

  constructor() {
    super();
    const defaultHandler = new HandlerMethod({}, () => new InterruptModel());
    this.setDefaultHandler(defaultHandler);
  }

  match(registraction: MappingRegistration<RequestMappingInfo>, path: string, request: HttpServletRequest): HandlerMethod {
    const mapping = registraction.getMapping();
    const handlerMethod = registraction.getHandlerMethod();
    const pathPatterns = mapping.value;
    const matcher = new PathMatcher();
    for (let pattern of pathPatterns) {
      const result = matcher.matchPattern(pattern, path);
      // 如果当前路由匹配成功
      if (result) {
        handlerMethod.supportThisMethod = mapping.method[request.method];
        // 将匹配的路径变量值，设置到pathVariables
        request.pathVariables = result.params;
        return handlerMethod;
      }
    }
  }
}
