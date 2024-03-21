/**
 * @module AbstractHandlerMethodMapping
 * @description 抽象请求方法映射
 */
import hot from 'nodejs-hmr';
import AbstractHandlerMapping from "./AbstractHandlerMapping";
import MappingRegistry from './registry/MappingRegistry';
import ServletContext from "../http/ServletContext";
import HttpServletRequest from "../http/HttpServletRequest";
import MappingRegistration from './registry/MappingRegistration';
import HandlerMethod from '../method/HandlerMethod';
import HttpStatusHandlerMethod from '../method/HttpStatusHandlerMethod';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HttpStatus from '../http/HttpStatus';

export default abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping {

  private readonly mappingRegistry: MappingRegistry<T>

  protected abstract match(registraction: MappingRegistration<T>, lookupPath: string, request: HttpServletRequest): HandlerMethod

  constructor(configurer: WebMvcConfigurationSupport) {
    super(configurer);
    this.mappingRegistry = new MappingRegistry<T>(configurer)
    hot.create(module)
      .preload((old) => {
        hot
          .createHotUpdater<MappingRegistration<T>>(this.mappingRegistry.getRegistration(), null, old)
          .needHot((m, ctor) => m.getHandlerMethod().beanType === ctor)
          .remove();
      });
  }

  /**
   * 注册一个映射方法
   */
  registerHandlerMethod(name: string, mapping: T, handler: any, method?: Function) {
    this.mappingRegistry.register(name, mapping, handler, method);
  }

  /**
   * 移除一个映射方法
   * @param mapping 
   */
  removeHandlerMethod(mapping: T) {
    this.mappingRegistry.unregister(mapping);
  }

  getRegistration() {
    return this.mappingRegistry.getRegistration();
  }

  /**
  * 根据请求上下信息，获取用于处理当前请求的处理器.
  */
  getHandlerInternal(context: ServletContext) {
    const lookupPath = this.initLookupPath(context.request);
    const handler = this.lookupHandlerMethod(lookupPath, context.request);
    return handler ? handler.createWithResolvedBean() : null;
  }

  /**
   * 根据请求查找对应的HandlerMethod
   */
  lookupHandlerMethod(lookupPath: string, request: HttpServletRequest): HandlerMethod {
    const registry = this.mappingRegistry.getRegistration();
    for (let registration of registry.values()) {
      const handler = this.match(registration, lookupPath, request);
      // 如果没有找到，则继续查找
      if (!handler) continue;
      return handler;
    }
  }

  getMappingForMethod(handler: HandlerMethod) {
    for (let info of this.mappingRegistry.getRegistration().values()) {
      if (info.getHandlerMethod() === handler) {
        return info.getMapping();
      }
    }
  }
}