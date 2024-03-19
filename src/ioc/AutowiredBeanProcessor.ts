/**
 * @module AutowiredBeanProcessor
 * @description 自动装配处理
 */

import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import DefaultListableBeanFactory from "./DefaultListableBeanFactory";
import Autowired from "./annotations/Autowired";

export default class AutowiredBeanProcessor {

  private readonly beanFactory: DefaultListableBeanFactory;

  constructor(beanFactory: DefaultListableBeanFactory) {
    this.beanFactory = beanFactory;
  }

  /**
   * 创建bean
   */
  private createBean(anno: RuntimeAnnotation) {
    const nativeAnno = anno.nativeAnnotation as InstanceType<typeof Autowired>;
    const use = (key) => this.beanFactory.getBean(key);
    // 优先级： type > propertyName
    const bean = use(anno.dataType) || use(anno.name)
    if (nativeAnno.required && (undefined === bean || null === bean)) {
      const name = anno.dataType ? anno.dataType.name : '';
      throw new Error(`Autowired Cannot find bean:${anno.name} (${name})`)
    }
    return bean;
  }

  /**
   * 处理属性的依赖bean
   */
  processPropertyBean(anno: RuntimeAnnotation) {
    const { ctor, name } = anno;
    Object.defineProperty(ctor.prototype, name, {
      get: () => this.createBean(anno),
    })
  }
}