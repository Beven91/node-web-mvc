/**
 * @module AbstractHandlerMethodMapping
 * @description 抽象请求方法映射
 */
import AbstractHandlerMapping from "./AbstractHandlerMapping";
import ServletContext from "../http/ServletContext";
import HttpServletRequest from "../http/HttpServletRequest";
import MappingRegistration from './registry/MappingRegistration';
import HandlerMethod from '../method/HandlerMethod';

export default abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping {

  private readonly registrations: Map<T, MappingRegistration<T>>

  protected abstract match(registraction: MappingRegistration<T>, lookupPath: string, request: HttpServletRequest): HandlerMethod

  constructor() {
    super();
    this.registrations = new Map<T, MappingRegistration<T>>();
  }

  /**
   * 注册一个映射方法
   */
  registerHandlerMethod(name: string, mapping: T, handler: any, method?: Function) {
    const methodHandler = new HandlerMethod(handler, method);
    this.registrations.set(mapping, new MappingRegistration<T>(mapping, methodHandler, name));
  }

  /**
   * 移除一个映射方法
   * @param mapping 
   */
  removeHandlerMethod(mapping: T) {
    this.registrations.delete(mapping);
  }

  /**
   * 获取所有注册的Mappings
   * @returns 
   */
  getRegistrations() {
    return this.registrations;
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
    for (let registration of this.registrations.values()) {
      const handler = this.match(registration, lookupPath, request);
      // 如果没有找到，则继续查找
      if (!handler) continue;
      return handler;
    }
  }

  getMappingForMethod(handler: HandlerMethod) {
    for (let info of this.registrations.values()) {
      if (info.getHandlerMethod() === handler) {
        return info.getMapping();
      }
    }
  }
}