/**
 * @module BeanDefinition
 * @description bean定义
 */
import { ClazzType } from '../../interface/declare';
import Tracer from '../../servlets/annotations/annotation/Tracer';

export type ScopeType = 'prototype' | 'singleton' | 'request'

export interface BeanTypeClazz {
  new(): any
}

export default class BeanDefinition {
  private beanType: ClazzType;

  /**
   * 对应的函数
   */
  public readonly method: Function;

  public readonly methodClazz: ClazzType;

  /**
   * 当前bean作用域类型
   */
  public readonly scope: ScopeType;

  /**
   * 当前类所在的文件
   */
  public readonly path: string;

  /**
  * 对应的类
  */
  public get clazz() {
    return this.beanType;
  }

  static toBeanName(name: string | Function) {
    if (typeof name === 'string' || name == null || name === undefined) {
      return name as string;
    }
    const beanName = String(name?.name);
    return beanName.slice(0, 1).toLowerCase() + beanName.slice(1, beanName.length);
  }

  /**
   * 构造一个bean定义
   * @param clazz bean构造函数
   * @param scope 作用域
   */
  constructor(clazz: Function, method: Function, scope: ScopeType) {
    // 表示是函数创建bean
    this.beanType = method ? null : clazz as ClazzType;
    this.methodClazz = method ? clazz as ClazzType : null;
    this.method = method;
    this.path = Tracer.getTracer(clazz)?.id || clazz.name;
    this.scope = scope || 'singleton';
  }

  /**
   * 如果是函数创建bean，由于typescript在函数没有显示指定返回类型时，无法获取返回值类型
   * 为了补全clazz 在创建实例后会根据实例类设置clazz类型
   * @param clazz
   */
  fallbackBeanType(clazz: ClazzType) {
    if (!this.beanType) {
      this.beanType = clazz;
    }
  }
}
