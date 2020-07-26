/**
 * @module BeanDefinition
 * @description bean定义
 */

export default class BeanDefinition {
  /**
   * 作用域
   */
  private beanScope: 'prototype' | 'singleton' | 'request'

  private beanCtor: Function

  /**
   * 当前bean作用域类型
   */
  public get scope() {
    return this.beanScope;
  }

  /**
   * 如果类型为 singleton 时缓存的instance
   */
  public instance: any

  /**
   * 当前对应bean构造函数
   */
  public get ctor(): Function {
    return this.beanCtor;
  }

  /**
   * 构造一个bean定义
   * @param ctor bean构造函数
   * @param scope bean的作用域
   */
  constructor(ctor, scope?) {
    this.beanScope = scope || 'singleton';
    this.beanCtor = ctor;
  }
}