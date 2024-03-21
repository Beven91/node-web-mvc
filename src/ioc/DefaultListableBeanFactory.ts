/**
 * @module DefaultListableBeanFactory
 * @description Ioc 容器
 */
import hot from "nodejs-hmr";
import BeanDefinition from "./BeanDefinition";
import ObjectProvider from "./provider/ObjectProvider";
import SingletonBeanProvider from './provider/SingletonBeanProvider';
import RequestBeanProvider from "./provider/RequestBeanProvider";
import PrototypeBeanProvider from "./provider/PrototypeBeanProvider";
import Javascript from "../interface/Javascript";

export default class DefaultListableBeanFactory {
  /**
   * 已注册bean定义字典
   */
  private readonly beanDefinitions = new Map<string | Function, BeanDefinition>();

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
   * 判断是否存在对应key的实体定义
   * @param key
   */
  containsBeanDefinition(key: string) {
    return this.beanDefinitions.has(key);
  }

  /**
   * 判断指定名称的bean是否为传入类型
   * @param beanName bean名称
   * @param beanType bean类型
   */
  isTypeMatch(beanName: string, beanType: Function) {
    const definition = this.beanDefinitions.get(beanName);
    return Javascript.getClass(definition?.ctor).isEqualOrExtendOf(beanType);
  }

  /**
   * 获取指定名称的 bean定义
   * @param name 
   */
  getBeanDefinition(name: string | Function): BeanDefinition {
    return this.beanDefinitions.get(name);
  }

  /**
   * 获取指定bean
   * @param {String} name bean类型名
   * @param {Array<any>} args 参数
   */
  getBean<T = any>(name: string, ...args) {
    const definition = (this.getBeanDefinition(name) || {}) as BeanDefinition;
    const provider = this.providers.get(definition.scope);
    return (provider ? provider.createInstance(definition.ctor, args) : null) as T
  }

  /**
   * 获取指定类型的bean实例
   * @param beanType bean类型
   * @param args 构造函数参数
   */
  getBeanOfType<T = any>(beanType: Function, ...args) {
    let definition = this.getBeanDefinition(beanType);
    if (!definition) {
      definition = new BeanDefinition(beanType);
      this.registerBeanDefinition(beanType, definition);
    }
    const provider = this.providers.get(definition.scope);
    return (provider ? provider.createInstance(definition.ctor, args) : null) as T;
  }

  /**
   * 注册一个bean
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  registerBeanDefinition(beanName: string | Function, beanDefinition: BeanDefinition) {
    if (this.beanDefinitions.get(beanName)) {
      throw new Error(`已存在同名的Bean:${beanName}`);
    }
    this.beanDefinitions.set(beanName, beanDefinition);
  }
}