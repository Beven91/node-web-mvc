/**
 * @module AutowiredBeanProcessor
 * @description 自动装配处理
 */

import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import DefaultListableBeanFactory from "./DefaultListableBeanFactory";
import BeanDefinition from "./BeanDefinition";

export class AutowiredOptions {

  constructor(options) {
    if (typeof options === 'string') {
      this.name = options;
    } else {
      options = options || {};
      this.name = options.name;
      this.required = options.required !== true;
    }
  }

  name?: string

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
    const name = options.name || meta.name
    const beanFactory = DefaultListableBeanFactory.getInstance();
    const definition = (beanFactory.getDefinition(name) || {}) as BeanDefinition;
    const bean = beanFactory.getBean(name);
    if (!definition) {
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
}

export default new AutowiredBeanProcessor();