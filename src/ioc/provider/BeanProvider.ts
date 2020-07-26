/**
 * @module BeanProvider
 * @description bean创建
 */

import BeanDefinition from "../BeanDefinition";

export default interface BeanProvider {

  /**
   * 创建指定作用域类型的bean
   * @param name 
   * @param definition 
   */
  createInstance(name: string, definition: BeanDefinition)

}