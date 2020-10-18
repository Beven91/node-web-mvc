/**
 * @module MappingRegistry 
 * @description 映射注册表
 */
import MappingRegistration from './MappingRegistration';
import HandlerMethod from '../../method/HandlerMethod';

export default class MappingRegistry<T> {

  private readonly registry: Map<T, MappingRegistration<T>>

  constructor() {
    this.registry = new Map<T, MappingRegistration<T>>();
  }

  /**
   * 获取注册表信息
   */
  getRegistration() {
    return this.registry;
  }

  /**
   * 登记一个映射配置。
   */
  register(name: string, mapping: T, bean: object, method: Function) {
    const methodHandler = new HandlerMethod(bean, method);
    this.registry.set(mapping, new MappingRegistration<T>(mapping, methodHandler, name));
  }

  /**
   * 取消注册
   */
  unregister(mapping: T) {
    this.registry.delete(mapping);
  }
}