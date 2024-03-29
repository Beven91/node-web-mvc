/**
 * @module BeanDefinition
 * @description bean定义
 */
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import Scope from '../../servlets/annotations/Scope';
import Autowired from '../annotations/Autowired';

export type ScopeType = 'prototype' | 'singleton' | 'request'

export default class BeanDefinition {
  /**
   * 作用域
   */
  // private beanScope: 'prototype' | 'singleton' | 'request'

  public readonly clazz: Function

  // 当前Bean配置的所有自动注入注解
  public readonly autowrieds: RuntimeAnnotation<InstanceType<typeof Autowired>>[]

  /**
   * 当前bean作用域类型
   */
  public get scope() {
    const annotation = RuntimeAnnotation.getClassAnnotation(this.clazz, Scope);
    return annotation?.nativeAnnotation?.scope || 'singleton';
  }

  /**
   * 构造一个bean定义
   * @param clazz bean构造函数
   * @param scope 作用域
   */
  constructor(clazz) {
    this.clazz = clazz;
    this.autowrieds = RuntimeAnnotation.getAnnotations(Autowired, clazz);
  }
}