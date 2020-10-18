/**
 * @module SingletonBeanProvider
 * @description 全局单例bean处理
 */

import AbstractBeanProvider from "./AbstractBeanProvider";

export default class SingletonBeanProvider extends AbstractBeanProvider {

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