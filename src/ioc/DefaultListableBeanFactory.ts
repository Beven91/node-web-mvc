/**
 * @module DefaultListableBeanFactory
 * @description Ioc 容器
 */
import hot from "nodejs-hmr";
import BeanDefinition, { ScopeType } from "./BeanDefinition";
import BeanFactory from './BeanFactory';
import ObjectProvider from "./provider/ObjectProvider";
import SingletonBeanProvider from './provider/SingletonBeanProvider';
import RequestBeanProvider from "./provider/RequestBeanProvider";
import PrototypeBeanProvider from "./provider/PrototypeBeanProvider";

const runtime = {
  instance: null
}

export default class DefaultListableBeanFactory implements BeanFactory {
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
  private readonly beanDefinitions = new Map<any, BeanDefinition>();

  // bean提供者
  private readonly providers = new Map<string, ObjectProvider>();

  constructor() {
    this.providers.set('prototype', new PrototypeBeanProvider());
    this.providers.set('singleton', new SingletonBeanProvider());
    this.providers.set('request', new RequestBeanProvider());
    /**
     * 内部热更新 
     */
    hot.create(module).preload((old) => {
      hot
        .createHotUpdater<BeanDefinition>(this.beanDefinitions, null, old)
        .needHot((definition, ctor) => definition.ctor === ctor)
        .remove();
    });
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
    const definition = (this.getDefinition(name) || {}) as BeanDefinition;
    const provider = this.providers.get(definition.scope);
    return provider ? provider.createInstance(definition.ctor, args) : null;
  }

  /**
   * 获取指定类型的bean实例
   * @param beanType bean类型
   * @param args 构造函数参数
   */
  getBeanOfType(beanType, scope: ScopeType, ...args) {
    let definition = this.getDefinition(beanType);
    if (!definition) {
      definition = new BeanDefinition(beanType, scope);
      this.registerBeanDefinition(beanType, definition);
    }
    const provider = this.providers.get(definition.scope);
    return provider ? provider.createInstance(definition.ctor, args) : null;
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