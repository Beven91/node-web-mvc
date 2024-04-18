import BeanOptions from "../../ioc/annotations/BeanOptions";
import Component from "../../ioc/annotations/Component";
import BeanDefinition from "../../ioc/factory/BeanDefinition";
import { BeanFactory } from "../../ioc/factory/BeanFactory";
import CglibAopProxyPostProcesor from "../../ioc/processor/CglibAopProxyPostProcesor";
import ApplicationContextAwareProcessor from "../../ioc/processor/ApplicationContextAwareProcessor";
import AutowiredAnnotationBeanPostProcessor from "../../ioc/processor/AutowiredAnnotationBeanPostProcessor";
import Scope from "../annotations/Scope";
import ElementType from "../annotations/annotation/ElementType";
import RuntimeAnnotation, { } from "../annotations/annotation/RuntimeAnnotation";
import registerHotUpdate from "./hot-update";
import ConfigurationBeanPostProcessor from "../../ioc/processor/ConfigurationBeanPostProcessor";

export default abstract class AbstractApplicationContext {

  abstract getBeanFactory(): BeanFactory

  constructor() {
    // 注册热更新
    registerHotUpdate(
      this.getBeanFactory.bind(this),
      this.registerWithAnnotation.bind(this),
      this.createSingletonBeans.bind(this)
    );
  }

  prepareBeanFactory() {
    const factory = this.getBeanFactory();
    factory.addBeanPostProcessor(
      new AutowiredAnnotationBeanPostProcessor(factory),
      new ApplicationContextAwareProcessor(this),
      new ConfigurationBeanPostProcessor(factory),
      new CglibAopProxyPostProcesor(factory),
    )
  }

  /**
   * 根据注解注册Bean定义
   * @param annotation Component注解
   */
  private registerWithAnnotation(annotation: RuntimeAnnotation<InstanceType<typeof Component>>) {
    const clazz = annotation.ctor;
    const scopeAnno = RuntimeAnnotation.getClassAnnotation(clazz, Scope);
    const name = annotation.nativeAnnotation.value;
    const scope = scopeAnno?.nativeAnnotation?.scope;
    const definition = new BeanDefinition(clazz, null, scope);
    const beanFactory = this.getBeanFactory();
    if (name) {
      beanFactory.registerBeanDefinition(name, definition);
    }
    beanFactory.registerBeanDefinition(BeanOptions.toBeanName(definition.clazz.name), definition);
    beanFactory.registerBeanDefinition(annotation.ctor, definition);
    return definition;
  }

  /**
   * 扫描注册所有bean
   */
  registerAllComponentBeans(fallback = false) {
    const beanFactory = this.getBeanFactory();
    const annotations = RuntimeAnnotation.getAnnotations(Component);
    annotations.forEach((annotation) => {
      switch (annotation.elementType) {
        case ElementType.TYPE:
          if (fallback && beanFactory.getBeanDefinition(annotation.ctor)) {
            // 在fallback模式下，如果已存在，则跳过
            return;
          }
          this.registerWithAnnotation(annotation);
          break;
      }
    });
  }

  createSingletonBeans() {
    const beanFactory = this.getBeanFactory();
    const keys = beanFactory.getBeanDefinitionNames();
    for (const key of keys) {
      const definition = beanFactory.getBeanDefinition(key);
      if (definition.scope == 'singleton') {
        beanFactory.getBean(key);
      }
    }
  }

  onFinish() {
  }

  refresh() {
    this.prepareBeanFactory();
    this.registerAllComponentBeans();
    this.createSingletonBeans();
    this.registerAllComponentBeans(true);
    this.onFinish();
  }
}