import BeanPostProcessor from "../processor/BeanPostProcessor"
import { BeanDefinitionRegistry, BeanDefinitonKey } from "./BeanDefinitionRegistry"

export interface BeanFactory extends BeanDefinitionRegistry {
  /**
   * 是否包含指定名称的Bean定义
   */
  containsBean(key: BeanDefinitonKey): boolean

  /**
   * 判定指定Bean是否为单例
   */
  isSingleton(key: BeanDefinitonKey): boolean

  /**
   * 判定指定Bean是否为原型模式
   */
  isPrototype(key: BeanDefinitonKey): boolean

  /**
   * 判定指定名称Bean是为beanType参数指定的类型
   * @param beanName bean定义名
   * @param espectBeanType 预期的bean类型
   */
  isTypeMatch(beanName: BeanDefinitonKey, espectBeanType: Function): boolean

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
  getBean<T = any>(name: string): T

  getBean<T = any>(...args: any): T

  /**
   * 根据bean获取对应的beanType
   * @param name bean定义名
   */
  getType(beanName: BeanDefinitonKey): Function

  /**
   * 获取指定类型的所有实例包括继承关系
   */
  getBeanOfType<T extends abstract new (...args:any[]) => any>(beanType: T): InstanceType<T>[]

  /**
   * 添加一个或多个bean处理器
   */
  addBeanPostProcessor(...processors: BeanPostProcessor[]): void

  removeBeanInstance(beanName: BeanDefinitonKey): void
}