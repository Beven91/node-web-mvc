/**
 * @module MappingRegistration
 * @description 映射登记信息
 */
import HandlerMethod from '../../method/HandlerMethod';

export default class MappingRegistration<T> {
  // 映射配置
  private mapping: T

  // 当前映射对应的执行函数
  private readonly handlerMethod: HandlerMethod

  // 映射名称
  private mappingName: string

  constructor(mapping: T, handlerMethod: HandlerMethod, mappingName: string) {
    this.mapping = mapping;
    this.handlerMethod = handlerMethod;
    this.mappingName = mappingName;
  }

  /**
   * 获取当前映射配置
   */
  public getMapping() {
    return this.mapping;
  }

  /**
   * 获取当前映射对应的执行函数
   */
  public getHandlerMethod() {
    return this.handlerMethod;
  }

  /**
   * 获取当前映射名称
   */
  public getMappingName() {
    return this.mappingName;
  }
}