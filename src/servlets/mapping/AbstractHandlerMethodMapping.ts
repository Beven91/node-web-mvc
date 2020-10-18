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

export default abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping {

  private mappingRegistry = new MappingRegistry<T>()

  protected abstract match(registraction: MappingRegistration<T>, lookupPath: string, request: HttpServletRequest): HandlerMethod

  constructor() {
    super();
    const regitry = this.mappingRegistry.getRegistration();
    hot.create(module)
      .preload((old) => {
        // 预更新时，清空当前控制器已注册路由
        const removes = [];
        const beanType = old.exports.default || old.exports;
        if (typeof beanType !== 'function') {
          return;
        }
        for (let key of regitry.keys()) {
          const registration = regitry.get(key);
          if (registration.getHandlerMethod().beanType === beanType) {
            removes.push(key);
          }
        }
        // 移除旧的配置
        removes.forEach((r) => regitry.delete(r));
      });
  }

  /**
   * 注册一个映射方法
   */
  registerHandlerMethod(name: string, mapping: T, handler: any, method: Function) {
    this.mappingRegistry.register(name, mapping, handler, method);
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
    let methodNotAllowed = false;
    for (let registration of registry.values()) {
      const handler = this.match(registration, lookupPath, request);
      if(handler && !handler.supportThisMethod){
        methodNotAllowed = true;
        continue;
      }
      if (handler){
        return handler;
      }
    }
    return methodNotAllowed ? new HttpStatusHandlerMethod(415) : null;
  }
}