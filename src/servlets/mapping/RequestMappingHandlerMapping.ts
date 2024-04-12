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

export default class RequestMappingHandlerMapping extends AbstractHandlerMethodMapping<RequestMappingInfo> implements InitializingBean {

  constructor() {
    super();
    hotUpdate(this);
  }

  afterPropertiesSet(): void {
    this.registerAllAnnotationMappings();
  }

  registerAnnotationMappings(annotation: RuntimeAnnotation<InstanceType<typeof RequestMapping>>) {
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
      });
      requestMapping.value = values;
    }
    // 覆盖为标准的produces
    (anno as RequestMappingExt).mapping = requestMapping;
    // 注册mapping
    this.registerHandlerMethod(name, requestMapping, target, annotation.method);
  }

  registerAllAnnotationMappings() {
    const annotations = RuntimeAnnotation.getTypedRuntimeAnnotations(RequestMapping);
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

  public checkRequest(servletContext: ServletContext, mapping: RequestMappingInfo, handler: HandlerMethod) {
    const request = servletContext.request;
    if (!mapping.method[request.method]) {
      return new HttpStatusHandlerMethod(HttpStatus.METHOD_NOT_ALLOWED);
    } else if (!this.isConsumeable(servletContext, mapping)) {
      return new HttpStatusHandlerMethod(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
    return handler;
  }

  match(registraction: MappingRegistration<RequestMappingInfo>, path: string, request: HttpServletRequest): HandlerMethod {
    const mapping = registraction.getMapping();
    const handlerMethod = registraction.getHandlerMethod();
    const pathPatterns = mapping.value;
    const matcher = this.pathMatcher;
    for (let pattern of pathPatterns) {
      const result = matcher.matchPattern(pattern, path);
      // 如果当前路由匹配成功
      if (result && mapping.method[request.method]) {
        // 将匹配的路径变量值，设置到pathVariables
        request.pathVariables = result.params;
        return this.checkRequest(request.servletContext, mapping, handlerMethod);
      }
    }
  }
}

// 热更新支持
function hotUpdate(handlerMapping: RequestMappingHandlerMapping) {
  hot
    .create(module)
    .preload((old) => {
      const file = old.filename;
      const registration = handlerMapping.getRegistrations();
      const removeList = [] as any[];
      for (let element of registration.values()) {
        const tracer = Tracer.getTracer(element.getHandlerMethod()?.beanType)
        if (tracer?.isDependency(file)) {
          removeList.push(element.getMapping());
        }
      }
      removeList.forEach((item) => registration.delete(item));
    })
    .postend((latest) => {
      const file = latest.filename;
      const annotations = RuntimeAnnotation.getTypedRuntimeAnnotations(RequestMapping);
      annotations.forEach((annotation) => {
        const tracer = Tracer.getTracer(annotation.ctor);
        if (tracer?.isDependency(file)) {
          handlerMapping.registerAnnotationMappings(annotation);
        }
      });
    })
}