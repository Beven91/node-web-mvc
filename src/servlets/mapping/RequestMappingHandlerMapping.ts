/**
 * @module RequestMappingHandlerMapping
 * @description controller请求方法映射处理器
 */
import hot from 'nodejs-hmr';
import AbstractHandlerMethodMapping from "./AbstractHandlerMethodMapping";
import RequestMappingInfo, { ensureArray } from './RequestMappingInfo';
import HttpServletRequest from "../http/HttpServletRequest";
import MappingRegistration from '../mapping/registry/MappingRegistration';
import HandlerMethod from '../method/HandlerMethod'
import RequestMapping, { RequestMappingExt } from "../annotations/mapping/RequestMapping";
import RuntimeAnnotation, { } from "../annotations/annotation/RuntimeAnnotation";
import ElementType from "../annotations/annotation/ElementType";
import ServletContext from '../http/ServletContext';
import HttpStatusHandlerMethod from '../method/HttpStatusHandlerMethod';
import HttpStatus from '../http/HttpStatus';
import InitializingBean from '../../ioc/processor/InitializingBean';
import Tracer from '../annotations/annotation/Tracer';
import { ClazzType } from '../../interface/declare';
import CorsOrigin from '../cors/CorsOrigin';
import CorsConfiguration from '../cors/CorsConfiguration';
import CorsUtils from '../util/CorsUtils';
import HttpHeaders from '../http/HttpHeaders';
import MediaType from '../http/MediaType';
import { PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE } from './HandlerMapping';
import PathMatcher from '../util/PathMatcher';

export default class RequestMappingHandlerMapping extends AbstractHandlerMethodMapping<RequestMappingInfo> implements InitializingBean {

  constructor() {
    super();
    registerHotUpdate(this);
  }

  afterPropertiesSet(): void {
    this.registerAllAnnotationMappings();
  }

  registerAnnotationMappings(annotation: RuntimeAnnotation<typeof RequestMapping>) {
    const isNotAction = annotation.elementType !== ElementType.METHOD;
    // 仅注册action路由 action路由 = controller路由 + action路由
    if (isNotAction) return;
    const target = annotation.ctor;
    const name = `@${target.name}/${annotation.name}`;
    const anno = annotation.nativeAnnotation;
    const controllerAnno = RuntimeAnnotation.getClassAnnotation(target, RequestMapping)?.nativeAnnotation;
    const produces = anno.produces || controllerAnno?.produces || '';
    const requestMapping = new RequestMappingInfo(anno.value, anno.method, ensureArray(produces), anno.params, anno.headers, anno.consumes);
    const actionPaths = requestMapping.value || [];
    const controllerPaths = ensureArray(controllerAnno?.value || ['']);
    const values = [];
    if (controllerPaths.length > 0) {
      // 合并controller路由
      controllerPaths.forEach((controllerPath) => {
        actionPaths.map((actionPath) => {
          const exp = (controllerPath + '/' + actionPath).replace(/\/{2,3}/, '/');
          values.push(exp);
        })
        // 预构建模式缓存
        PathMatcher.preBuildPattern(values);
      });
      requestMapping.value = values;
    }
    // 覆盖为标准的produces
    (anno as RequestMappingExt).mapping = requestMapping;
    // 注册mapping
    this.registerHandlerMethod(name, requestMapping, target, annotation.method);
  }

  registerAllAnnotationMappings() {
    const annotations = RuntimeAnnotation.getAnnotations(RequestMapping);
    annotations.forEach((annotation) => {
      this.registerAnnotationMappings(annotation);
    })
  }

  private isConsumeable(servletContext: ServletContext, mapping: RequestMappingInfo) {
    const request = servletContext.request;
    const consumes = mapping.consumes || [];
    const contentType = request.headers['content-type'];
    if (consumes.length < 1) {
      return true;
    }
    return !!consumes.find((m) => contentType.indexOf(m) > -1);
  }

  public checkRequest(servletContext: ServletContext, mapping: RequestMappingInfo, handler: HandlerMethod, requestMethod: string) {
    if (!mapping.method[requestMethod]) {
      return new HttpStatusHandlerMethod(HttpStatus.METHOD_NOT_ALLOWED);
    } else if (!this.isConsumeable(servletContext, mapping)) {
      return new HttpStatusHandlerMethod(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
    return handler;
  }

  private getRequestMethod(request: HttpServletRequest) {
    if (CorsUtils.isPreFlightRequest(request)) {
      return String(request.getHeaderValue(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD)?.[0]).toUpperCase();
    } else {
      return request.method;
    }
  }

  handleMatch(mapping: RequestMappingInfo, request: HttpServletRequest) {
    const produces = mapping.produces || [];
    const mediaTypes = produces.map((m) => new MediaType(m));
    request.setAttribute(PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE, mediaTypes);
  }

  match(registraction: MappingRegistration<RequestMappingInfo>, path: string, request: HttpServletRequest): HandlerMethod {
    const mapping = registraction.getMapping();
    const handlerMethod = registraction.getHandlerMethod();
    const pathPatterns = mapping.value;
    const matcher = this.pathMatcher;
    const requestMethod = this.getRequestMethod(request);
    for (let pattern of pathPatterns) {
      const result = matcher.matchPattern(pattern, path);
      // 如果当前路由匹配成功
      if (result && mapping.method[requestMethod]) {
        // 将匹配的路径变量值，设置到pathVariables
        request.pathVariables = result.params;
        const handler = this.checkRequest(request.servletContext, mapping, handlerMethod, requestMethod);
        this.handleMatch(mapping, request);
        return handler;
      }
    }
  }

  initCorsConfiguration(beanType: ClazzType, method: Function) {
    const clazzCors = RuntimeAnnotation.getClassAnnotation(beanType, CorsOrigin)?.nativeAnnotation;
    const methodCors = RuntimeAnnotation.getMethodAnnotation(beanType, method, CorsOrigin)?.nativeAnnotation;
    if (clazzCors || methodCors) {
      const mapping = RuntimeAnnotation.getMethodAnnotation(beanType, method, RequestMapping)?.nativeAnnotation;
      const corsConfig = new CorsConfiguration();
      this.updateCorsConfig(corsConfig, clazzCors);
      this.updateCorsConfig(corsConfig, methodCors);
      const methods = mapping.method instanceof Array ? mapping.method : [mapping.method];
      methods.forEach((method) => {
        corsConfig.addAllowedMethod(method);
      })
      return corsConfig.applyPermitDefaultValues();
    }
  }

  updateCorsConfig(config: CorsConfiguration, anno: InstanceType<typeof CorsOrigin>) {
    if (!anno) return;
    anno.origins?.forEach?.((origin) => config.addAllowedOrigin(origin));
    anno.originPatterns?.forEach?.((pattern) => config.addAllowedOriginPattern(pattern));
    anno.allowedHeaders?.forEach?.((header) => config.addAllowedHeader(header));
    anno.methods?.forEach?.((method) => config.addAllowedMethod(method));
    config.allowCredentials = anno.allowCredentials;
    config.allowPrivateNetwork = anno.allowPrivateNetwork;
    if (anno.maxAge >= 0) {
      config.maxAge = anno.maxAge;
    }
  }

}

// 热更新支持
function registerHotUpdate(handlerMapping: RequestMappingHandlerMapping) {
  hot
    .create(module)
    .clean()
    .preload((old) => {
      const file = old.filename;
      const registration = handlerMapping.getRegistrations();
      const removeKeys = [] as any[];
      for (let element of registration.values()) {
        const beanType = element.getHandlerMethod()?.beanType;
        if (Tracer.isDependency(beanType, file)) {
          removeKeys.push(element.getMapping());
        }
      }
      removeKeys.forEach((item) => registration.delete(item));
    })
    .postend((latest) => {
      const file = latest.filename;
      const annotations = RuntimeAnnotation.getTypedRuntimeAnnotations(RequestMapping);
      annotations.forEach((annotation) => {
        if (Tracer.isDependency(annotation.ctor, file)) {
          handlerMapping.registerAnnotationMappings(annotation);
        }
      });
    })
}