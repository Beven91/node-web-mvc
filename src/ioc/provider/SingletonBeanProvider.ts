/**
 * @module SingletonBeanProvider
 * @description 全局单例bean处理
 */

import BeanProvider from "./BeanProvider";
import BeanDefinition from "../BeanDefinition";
import DefaultListableBeanFactory from "../DefaultListableBeanFactory";

class SingletonBeanProvider implements BeanProvider {

  /**
   * 创建bean实例
   * @param definition 
   * @param name 
   */
  createInstance(name: string, definition: BeanDefinition) {
    const beanFactory = DefaultListableBeanFactory.getInstance();
    if (!definition.instance) {
      definition.instance = beanFactory.getBean(name);
    }
    return definition.instance;
  }
}

export default new SingletonBeanProvider();