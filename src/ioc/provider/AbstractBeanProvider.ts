/**
 * @module AbstractBeanProvider
 * @description 抽象bean提供者
 */

import ObjectProvider from "./ObjectProvider";

export default abstract class AbstractBeanProvider implements ObjectProvider {

  protected beanInstances: Map<Function, any>;

  constructor() {
    this.beanInstances = new Map<Function, any>();
  }

  createInstance(beanType: Function, args: Array<any>) {
    const Bean = beanType as any;
    const bean = new Bean(...args);
    return bean;
  }
}