import { ClazzType } from "../../servlets/annotations/annotation/RuntimeAnnotation"
import BeanDefinition from "./BeanDefinition"

export type BeanDefinitonKey = string | ClazzType

export interface BeanDefinitionRegistry {
  /**
   * 注册一个bean定义
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  registerBeanDefinition(beanName: BeanDefinitonKey, beanDefinition: BeanDefinition)

  /**
   * 获取指定key的bean定义
   * @param beanKey
   */
  getBeanDefinition(key: BeanDefinitonKey): BeanDefinition

  /**
   * 移除bean定义
   */
  removeBeanDefinition(beanName: BeanDefinitonKey)

  /**
   * 获取所有已注册的bean定义key
   */
  getBeanDefinitionNames(): IterableIterator<BeanDefinitonKey>
}