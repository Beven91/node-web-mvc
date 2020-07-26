/**
 * @module RequestBeanProvider
 * @description request作用域类型的bean创建
 */

import BeanProvider from "./BeanProvider";
import BeanDefinition from "../BeanDefinition";
import DefaultListableBeanFactory from "../DefaultListableBeanFactory";
import ServletContext from '../../servlets/http/ServletContext';

class RequestBeanProvider implements BeanProvider {

  servletContext: ServletContext

  createInstance(name: string, definition: BeanDefinition) {
    const requestionInstances = this.servletContext.requestDefinitionInstances;
    const beanFactory = DefaultListableBeanFactory.getInstance();
    if (!requestionInstances[name]) {
      requestionInstances[name] = beanFactory.getBean(name);
    }
    return requestionInstances[name];
  }
}

export default new RequestBeanProvider();