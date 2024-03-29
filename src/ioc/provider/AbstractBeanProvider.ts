/**
 * @module AbstractBeanProvider
 * @description 抽象bean提供者
 */
import ObjectProvider from "./ObjectProvider";

export default abstract class AbstractBeanProvider implements ObjectProvider {

  /**
   * 根据类型移除对应的实例
   */
  removeInstancesByClazz(clazz: Function) {

  }

  createInstance(beanType: Function, args: Array<any>) {
    const Bean = beanType as any;
    const bean = new Bean(...args);
    return bean;
  }
}