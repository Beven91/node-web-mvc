import { ClazzType } from "../../interface/declare"
import BeanDefinition from "./BeanDefinition"

export interface BeanDefinitionRegistry {
  /**
   * 注册一个bean定义
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  registerBeanDefinition(beanName: string, beanDefinition: BeanDefinition)

  /**
   * 获取指定名称的的bean定义
   * @param beanKey
   */
  getBeanDefinition(beanName: string): BeanDefinition

  /**
   * 移除bean定义
   */
  removeBeanDefinition(beanName: string)

  /**
   * 获取所有已注册的bean定义key
   */
  getBeanDefinitionNames(): IterableIterator<string>
}