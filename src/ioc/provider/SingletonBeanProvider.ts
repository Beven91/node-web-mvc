/**
 * @module SingletonBeanProvider
 * @description 全局单例bean处理
 */

import AbstractBeanProvider from "./AbstractBeanProvider";

export default class SingletonBeanProvider extends AbstractBeanProvider {

  private beanInstances: Map<Function, any> = new Map<Function, any>()

  removeInstancesByClazz(clazz: Function) {
    const removeKeys = [];
    this.beanInstances.forEach((instance, key) => {
      if (instance instanceof clazz) {
        removeKeys.push(key);
      }
    });
    removeKeys.forEach((k) => {
      this.beanInstances.delete(k);
    });
  }

  /**
   * 创建bean实例
   * @param definition 
   * @param name 
   */
  createInstance(beanType, args: Array<any>) {
    if (!this.beanInstances.get(beanType)) {
      const bean = super.createInstance(beanType, args);
      this.beanInstances.set(beanType, bean);
    }
    return this.beanInstances.get(beanType);
  }
}