/**
 * @module PrototypeBeanProvider
 * @description prototype作用域类型的bean创建
 */

import AbstractBeanProvider from "./AbstractBeanProvider";

export default class PrototypeBeanProvider extends AbstractBeanProvider {

  createInstance(beanType: Function, args: Array<any>) {
    return super.createInstance(beanType, args);
  }
}