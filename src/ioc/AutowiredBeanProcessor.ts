/**
 * @module AutowiredBeanProcessor
 * @description 自动装配处理
 */

import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import DefaultListableBeanFactory from "./DefaultListableBeanFactory";

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
    const beanFactory = DefaultListableBeanFactory.getInstance();
    const use = (key) => beanFactory.getBean(key);
    // 优先级： type > propertyName
    const bean = use(meta.dataType) || use(meta.name)
    if (options.required && (undefined === bean || null === bean)) {
      const name = meta.dataType ? meta.dataType.name : '';
      throw new Error(`Autowired Cannot find bean:${meta.name} (${name})`)
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