/**
 * @module DefaultListableBeanFactory
 * @description Ioc 容器
 */
import BeanDefinition from "./BeanDefinition";
import AbstractBeanFactory from "./AbstractBeanFactory";
import { BeanDefinitonKey } from "./BeanDefinitionRegistry";
import BeanDefinitionOverrideException from "../../errors/BeanDefinitionOverrideException";
import RuntimeAnnotation, { } from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Bean from "../annotations/Bean";
import Scope from "../../servlets/annotations/Scope";
import Qualifier from "../annotations/Qualifier";
import InvalidBeanDefinitionException from "../../errors/InvalidBeanDefinitionException";
import { ClazzType } from "../../interface/declare";

export const methodBeanNameSymbol = Symbol('methodBeanNameSymbol');

export default class DefaultListableBeanFactory extends AbstractBeanFactory {
  /**
   * 已注册bean定义字典
   */
  private readonly beanDefinitions = new Map<BeanDefinitonKey, BeanDefinition>();

  private allowBeanDefinitionOverridable = false;

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
    if (!(beanDefinition instanceof BeanDefinition)) {
      throw new InvalidBeanDefinitionException(beanDefinition);
    }
    const overrideDefinition = this.beanDefinitions.get(beanName);
    if (overrideDefinition && this.isBeanDefinitionOverridable(beanName)) {
      throw new BeanDefinitionOverrideException(beanName, beanDefinition, overrideDefinition);
    }
    if (typeof beanName !== 'string') {
      this.registerComponentBeanAnnotations(beanDefinition.clazz || beanDefinition.methodClazz);
    }
    this.debug('Register Definition:', beanName);
    this.beanDefinitions.set(beanName, beanDefinition);
  }

  /**
   * 注册组件的Bean注解定义
   * @param clazz 
   */
  private registerComponentBeanAnnotations(clazz: ClazzType) {
    const annotations = RuntimeAnnotation.getAnnotations(Bean, clazz);
    annotations.forEach((anno) => {
      const scopeAnno = RuntimeAnnotation.getMethodAnnotation(clazz, anno.methodName, Scope);
      const qualifier = RuntimeAnnotation.getMethodAnnotation(clazz, anno.methodName, Qualifier);
      const scope = scopeAnno?.nativeAnnotation?.scope;
      const name = qualifier?.nativeAnnotation?.value || anno.methodName;
      const definition = new BeanDefinition(clazz, anno.method, scope);
      anno.method[methodBeanNameSymbol] = name;
      this.registerBeanDefinition(name, definition);
    });
  }

  isBeanDefinitionOverridable(beanName: BeanDefinitonKey) {
    return this.allowBeanDefinitionOverridable;
  }

  setAllowBeanDefinitionOverridable(value: boolean) {
    this.allowBeanDefinitionOverridable = value;
  }

  /**
   * 移除一个bean定义
   * @param beanName 
   */
  removeBeanDefinition(beanName: BeanDefinitonKey) {
    if (this.containsBeanDefinition(beanName)) {
      this.debug('Remove Definition:', beanName);
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

  destory(): void {
    super.destory();
    this.beanDefinitions.clear();
  }

}
