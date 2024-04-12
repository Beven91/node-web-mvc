/**
 * @module DefaultListableBeanFactory
 * @description Ioc 容器
 */
import BeanDefinition from "./BeanDefinition";
import AbstractBeanFactory from "./AbstractBeanFactory";
import { BeanDefinitonKey } from "./BeanDefinitionRegistry";
import BeanDefinitionOverrideException from "../../errors/BeanDefinitionOverrideException";
import InvalidBeanDefinitionException from "../../errors/InvalidBeanDefinitionException";

export default class DefaultListableBeanFactory extends AbstractBeanFactory {
  /**
   * 已注册bean定义字典
   */
  private readonly beanDefinitions = new Map<BeanDefinitonKey, BeanDefinition>();

  containsBeanDefinition(key: BeanDefinitonKey) {
    return !!this.getBeanDefinition(key);
  }

  /**
   * 根据beanType名称或者类型获取对应的bean定义信息
   * @param beanType bean类型
   */
  getBeanDefinition(name: BeanDefinitonKey): BeanDefinition {
    return this.beanDefinitions.get(name);
  }

  /**
   * 注册一个bean定义
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  registerBeanDefinition(beanName: BeanDefinitonKey, beanDefinition: BeanDefinition) {
    if(!(beanDefinition instanceof BeanDefinition)) {
      throw new InvalidBeanDefinitionException(beanDefinition);
    }
    const overrideDefinition = this.beanDefinitions.get(beanName);
    if (overrideDefinition) {
      throw new BeanDefinitionOverrideException(beanDefinition, overrideDefinition);
    }
    this.beanDefinitions.set(beanName, beanDefinition);
  }

  /**
   * 移除一个bean定义
   * @param beanName 
   */
  removeBeanDefinition(beanName: BeanDefinitonKey) {
    if (this.containsBeanDefinition(beanName)) {
      this.beanDefinitions.delete(beanName);
    }
  }

  /**
   * 获取所有已注册的bean定义key
   * @returns 
   */
  getBeanDefinitionNames() {
    return this.beanDefinitions.keys();
  }
}
