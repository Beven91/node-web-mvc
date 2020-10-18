/**
 * @module BeanDefinition
 * @description bean定义
 */
import RuntimeAnnotation from '../servlets/annotations/annotation/RuntimeAnnotation';
import Scope, { ScopeAnnotation } from '../servlets/annotations/Scope';

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
    let scope = 'singleton';
    const annotation = RuntimeAnnotation.getClassAnnotation(this.beanCtor, Scope);
    if (annotation) {
      const scopeAnno = annotation.nativeAnnotation as ScopeAnnotation;
      scope = scopeAnno.scope;
    }
    return scope;
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
   */
  constructor(ctor) {
    this.beanCtor = ctor;
  }
}