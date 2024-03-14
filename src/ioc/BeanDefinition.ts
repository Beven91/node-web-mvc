/**
 * @module BeanDefinition
 * @description bean定义
 */
import RuntimeAnnotation from '../servlets/annotations/annotation/RuntimeAnnotation';
import Scope from '../servlets/annotations/Scope';

export type ScopeType = 'prototype' | 'singleton' | 'request'

export default class BeanDefinition {
  /**
   * 作用域
   */
  // private beanScope: 'prototype' | 'singleton' | 'request'

  private beanCtor: Function

  /**
   * 当前bean作用域类型
   */
  public get scope() {
    const annotation = RuntimeAnnotation.getClassAnnotation(this.beanCtor, Scope);
    return annotation?.nativeAnnotation?.scope || 'singleton';
  }

  /**
   * 当前对应bean构造函数
   */
  public get ctor(): Function {
    return this.beanCtor;
  }

  /**
   * 构造一个bean定义
   * @param ctor bean构造函数
   * @param scope 作用域
   */
  constructor(ctor) {
    this.beanCtor = ctor;
  }
}