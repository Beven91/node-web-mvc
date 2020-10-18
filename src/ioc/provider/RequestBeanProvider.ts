/**
 * @module RequestBeanProvider
 * @description request作用域类型的bean创建
 */

import AbstractBeanProvider from "./AbstractBeanProvider";
import ServletContext from '../../servlets/http/ServletContext';

export default class RequestBeanProvider extends AbstractBeanProvider {

  servletContext: ServletContext

  createInstance(beanType: Function, args: Array<any>) {
    throw new Error('暂不支持request作用域的注入')
    // const requestionInstances = this.servletContext.requestDefinitionInstances;
    // if (!requestionInstances[name]) {
    //   requestionInstances[name] = beanFactory.getBean(name);
    // }
    // return requestionInstances[name];
  }
}