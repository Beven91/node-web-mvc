import type BeanDefinition from "./BeanDefinition"
import type ObjectProvider from "../provider/ObjectProvider"

export interface BeanFactory {
  /**
   * 是否包含指定名称的Bean定义
   */
  containsBean(key: string): boolean

  /**
   * 判定指定Bean是否为单例
   */
  isSingleton(key: string): boolean

  /**
   * 判定指定Bean是否为原型模式
   */
  isPrototype(key: string): boolean

  /**
   * 判定指定名称Bean是为beanType参数指定的类型
   * @param beanName bean定义名
   * @param espectBeanType 预期的bean类型
   */
  isTypeMatch(beanName: string, espectBeanType: Function): boolean

  /**
   * 根据指定beanType创建指定bean实例
   * @param beanType bean类型
   * @param args 构造函数参数值
   */
  getBean<T = any>(beanType: Function): T

  /**
   * 根据名称创建指定bean实例
   * @param name bean定义名
   * @param args 构造函数参数值
   */
  getBean<T = any>(name: string, ...args: any[]): T

  getBean<T = any>(...args: any): T

  /**
   * 根据bean名称获取对应的provider
   */
  getBeanProvider(name: string): ObjectProvider

  /**
   * 根据bean类型获取对应的provider
   * @param beanType 
   */
  getBeanProvider(beanType: Function): ObjectProvider

  /**
   * 根据bean获取对应的beanType
   * @param name bean定义名
   */
  getType(name: string): Function

}