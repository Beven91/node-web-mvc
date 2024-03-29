import Javascript from "../../interface/Javascript";
import BeanPostProcessor from "../processor/BeanPostProcessor";
import ObjectProvider from "../provider/ObjectProvider";
import PrototypeBeanProvider from "../provider/PrototypeBeanProvider";
import SingletonBeanProvider from "../provider/SingletonBeanProvider";
import BeanDefinition from "./BeanDefinition";
import { BeanFactory } from "./BeanFactory";

export default abstract class AbstractBeanFactory implements BeanFactory {

  private beanPostProcessors: BeanPostProcessor[]

  /**
   * 是否包含指定名称bean定义
   * @param key 
   */
  protected abstract containsBeanDefinition(key: string)

  /**
   * 根据beanType名称或者类型获取对应的bean定义信息
   * @param beanType bean类型
   */
  protected abstract getBeanDefinition(beanType: string | Function): BeanDefinition

  /**
   * 根据传入bean获取对应的provider
   * @param beanType 
   */
  abstract getBeanProvider(beanType: string | Function): ObjectProvider

  constructor() {
    this.beanPostProcessors = [];
  }

  /**
   * 判断传入名称的bean是否为单例
   * @param key 
   */
  isSingleton(key: string): boolean {
    return this.getBeanProvider(key) instanceof SingletonBeanProvider;
  }

  /**
   * 判断传入名称的bean是否为原型
   * @param key 
   */
  isPrototype(key: string): boolean {
    return this.getBeanProvider(key) instanceof PrototypeBeanProvider;
  }

  /**
   * 指定指定名称的bean构造函数或者类
   * @param name 
   */
  getType(name: string): Function {
    return this.getBeanDefinition(name)?.clazz;
  }

  /**
   * 是否包含指定名称的bean
   * @param key 
   * @returns 
   */
  containsBean(key: string) {
    return this.containsBeanDefinition(key);
  }

  /**
   * 判定指定名称Bean是为beanType参数指定的类型
   * @param beanName bean定义名
   * @param espectBeanType 预期的bean类型
   */
  isTypeMatch(beanName: string, beanType: Function) {
    const definition = this.getBeanDefinition(beanName);
    return Javascript.getClass(definition?.clazz).isEqualOrExtendOf(beanType);
  }

  private getBeanOfType<T = any>(beanType: Function, ...args: any[]) {
    let definition = this.getBeanDefinition(beanType);
    return this.doGetBean<T>(definition, ...args);
  }

  /**
   * 获取指定bean实例
   */
  getBean<T = any>(beanType: Function): T;
  getBean<T = any>(name: string, ...args: any[]): T;
  getBean<T = any>(...args: any): T;
  getBean<T = any>(name: string | Function, ...args: any[]) {
    if (typeof name === 'string') {
      const definition = (this.getBeanDefinition(name) || {}) as BeanDefinition;
      return this.doGetBean<T>(definition, ...args);
    } else {
      return this.getBeanOfType(name, ...args);
    }
  }

  /**
   * 根据Bean定义创建Bean实例
   * @param definition Bean定义
   * @param args 额外的构造参数 .... TODO 是否有必要保留?
   * @returns Bean的实例对象
   */
  private doGetBean<T>(definition: BeanDefinition, ...args: any[]) {
    const provider = this.getBeanProvider(definition.clazz);
    return provider?.createInstance?.(definition.clazz, args) as T
  }

  /**
   * 添加单个Bean处理器
   * @param processor 
   */
  addBeanPostProcessor(processor: BeanPostProcessor) {
    if (this.beanPostProcessors.indexOf(processor) < 0) {
      this.beanPostProcessors.push(processor);
    }
  }

  /**
   * 添加多个Bean处理器
   * @param processors 
   */
  addBeanPostProcessors(processors: BeanPostProcessor[]) {
    processors.forEach((processor) => this.addBeanPostProcessor(processor));
  }

  /**
   * 获取当前所有Bean处理器
   * @returns 
   */
  getBeanPostProcessors() {
    return this.beanPostProcessors;
  }
}