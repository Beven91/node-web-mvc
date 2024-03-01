/**
 * 标注指定控制器的作用域
 * 可选值为: 
 *    singleton (单例： 整个程序一个Controller仅有一个实例)
 *    prototype (多例： 每次都会创建一个新的Controller)
 */
import Target from "./Target";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";

export type ScopeType = 'singleton' | 'prototype' | 'reqeust' | 'session'

@Target
export class ScopeAnnotation {

  // 作用域
  scope: ScopeType

  constructor(meta: RuntimeAnnotation, scope: ScopeType) {
    this.scope = scope;
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target.install<typeof ScopeAnnotation>(ScopeAnnotation);