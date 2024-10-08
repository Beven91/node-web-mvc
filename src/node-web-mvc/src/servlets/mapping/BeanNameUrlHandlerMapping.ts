/**
 * @module BeanNameUrlHandlerMapping
 * @description 用于httprequest类型请求
 */

import HttpServletRequest from '../http/HttpServletRequest';
import ResourceHandlerRegistration from '../resources/ResourceHandlerRegistration';
import ResourceHandlerRegistry from '../resources/ResourceHandlerRegistry';
import ResourceHttpRequestHandler from '../resources/ResourceHttpRequestHandler';
import type { ResourceConfig } from '../config/WebAppConfigurerOptions';
import AbstractHandlerMapping from './AbstractHandlerMapping';
import ServletContext from '../http/ServletContext';

export default class BeanNameUrlHandlerMapping extends AbstractHandlerMapping {
  private readonly registry: ResourceHandlerRegistry;

  private readonly resource: ResourceConfig;

  constructor(registry: ResourceHandlerRegistry, resource: ResourceConfig) {
    super();
    this.registry = registry;
    this.resource = resource;
    this.setDefaultHandler(null);
  }

  protected getHandlerInternal(context: ServletContext): object {
    const request = context.request;
    const registrations = this.registry.registrations;
    const lookupPath = this.initLookupPath(request);
    for (const registration of registrations) {
      if (this.match(registration, lookupPath, request)) {
        return new ResourceHttpRequestHandler(registration, this.resource);
      }
    }
  }

  match(mapping: ResourceHandlerRegistration, path: string, request: HttpServletRequest): boolean {
    const pathPatterns = mapping.pathPatterns;
    const matcher = this.pathMatcher;
    for (const pattern of pathPatterns) {
      const result = matcher.matchPattern(pattern, path);
      // 如果当前路由匹配成功
      if (result) {
        return true;
      }
    }
  }
}
