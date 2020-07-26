/**
 * @module AutowiredBeanProcessor
 * @description 自动装配处理
 */

import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import DefaultListableBeanFactory from "./DefaultListableBeanFactory";
import BeanDefinition from "./BeanDefinition";
import SingletonBeanProvider from './provider/SingletonBeanProvider';
import RequestBeanProvider from "./provider/RequestBeanProvider";

export class AutowiredOptions {

  constructor(options) {
    options = options || {};
    this.required = options.required !== true;
  }

  /**
   * 是否当前装配的实例必须存在，如果无法装配，则抛出异常
   * 默认为:treu
   */
  required?: boolean
}

class AutowiredBeanProcessor {

  /**
   * 创建bean
   */
  private createBean(meta: RuntimeAnnotation, options: AutowiredOptions) {
    const { name } = meta;
    const beanFactory = DefaultListableBeanFactory.getInstance();
    const definition = (beanFactory.getDefinition(name) || {}) as BeanDefinition;

    let bean = null;
    switch (definition.scope) {
      case 'prototype':
        bean = beanFactory.getBean(name);
        break;
      case 'singleton':
        bean = SingletonBeanProvider.createInstance(name, definition);
        break;
      case 'request':
        bean = RequestBeanProvider.createInstance(name,definition);
    }

    if(!definition){
      throw new Error(`Cannot create bean:${name}, definition not found`)
    }
    if (options.required && (undefined === bean || null === bean)) {
      throw new Error(`Cannot create bean:${name}, create null`)
    }

    return bean;
  }

  /**
   * 处理属性的依赖bean
   */
  processPropertyBean(meta: RuntimeAnnotation, options: AutowiredOptions) {
    const { ctor, name } = meta;
    Object.defineProperty(ctor.prototype, name, {
      get: () => this.createBean(meta, options || {}),
    })
  }

  // /**
  //  * 处理方法的依赖bean
  //  */
  // processMethodBeans(meta: RuntimeAnnotation, options: AutowiredOptions) {
  //   const { target, descriptor } = meta;
  // }
}

export default new AutowiredBeanProcessor();