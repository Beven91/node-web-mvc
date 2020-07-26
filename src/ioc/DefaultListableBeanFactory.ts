/**
 * @module DefaultListableBeanFactory
 * @description Ioc 容器
 */
import BeanDefinition from "./BeanDefinition";

const runtime = {
  instance: null
}

export default class DefaultListableBeanFactory {
  /**
   * 获取注册
   */
  static getInstance(): DefaultListableBeanFactory {
    if (!runtime.instance) {
      runtime.instance = new DefaultListableBeanFactory();
    }
    return runtime.instance;
  }

  /**
   * 已注册bean定义字典
   */
  private beanDefinitions: Map<string, BeanDefinition>

  constructor() {
    this.beanDefinitions = new Map<string, BeanDefinition>();
  }

  /**
   * 获取指定名称的 bean定义
   * @param name 
   */
  getDefinition(name): BeanDefinition {
    return this.beanDefinitions.get(name);
  }

  /**
   * 获取指定bean
   * @param {String} name bean类型名
   * @param {Array<any>} args 参数
   */
  getBean(name, ...args) {
    const definition = this.beanDefinitions.get(name);
    if (!definition) {
      return null;
    }
    const Bean = definition.ctor as any;
    return new Bean(...args);
  }

  /**
   * 注册一个bean
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  registerBeanDefinition(beanName, beanDefinition) {
    if (this.beanDefinitions.get(beanName)) {
      throw new Error(`已存在同名的Bean:${beanName}`);
    }
    this.beanDefinitions.set(beanName, beanDefinition);
  }
}