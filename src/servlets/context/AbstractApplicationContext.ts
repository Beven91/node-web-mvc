import Component from '../../ioc/annotations/Component';
import BeanDefinition from '../../ioc/factory/BeanDefinition';
import { BeanFactory } from '../../ioc/factory/BeanFactory';
import Scope from '../annotations/Scope';
import ElementType from '../annotations/annotation/ElementType';
import RuntimeAnnotation, { } from '../annotations/annotation/RuntimeAnnotation';
import registerHotUpdate from './hot-update';
export default abstract class AbstractApplicationContext {
  abstract getBeanFactory(): BeanFactory;

  constructor() {
    // 注册热更新
    registerHotUpdate(
      this.getBeanFactory.bind(this),
      this.registerWithAnnotation.bind(this),
      this.createSingletonBeans.bind(this)
    );
  }

  prepareBeanFactory() {

  }

  abstract registerBeanPostProcessor(): void;

  /**
   * 根据注解注册Bean定义
   * @param annotation Component注解
   */
  private registerWithAnnotation(annotation: RuntimeAnnotation<typeof Component>) {
    const clazz = annotation.ctor;
    const scopeAnno = RuntimeAnnotation.getClassAnnotation(clazz, Scope);
    const name = annotation.nativeAnnotation.value;
    const scope = scopeAnno?.nativeAnnotation?.scope;
    const definition = new BeanDefinition(clazz, null, scope);
    const beanFactory = this.getBeanFactory();
    const clazzBeanName = BeanDefinition.toBeanName(definition.clazz);
    if (name && name !== clazzBeanName) {
      // 注册自定义名称
      beanFactory.registerBeanDefinition(name, definition);
    }
    // 根据类名注册
    beanFactory.registerBeanDefinition(clazzBeanName, definition);
    return definition;
  }

  /**
   * 扫描注册所有bean
   */
  registerAllComponentBeans(fallback = false) {
    const beanFactory = this.getBeanFactory();
    const annotations = RuntimeAnnotation.getAnnotations(Component);
    // 这里需要排除作用在同一个类上的多个component，防止重复注册
    const map = new Map<Function, true>();
    const singleAnnotations = [] as RuntimeAnnotation<typeof Component>[];
    annotations.forEach((annotation) => {
      if (annotation.elementType == ElementType.TYPE && !map.has(annotation.ctor)) {
        map.set(annotation.ctor, true);
        singleAnnotations.push(annotation);
      }
    });
    singleAnnotations.forEach((annotation) => {
      const beanName = BeanDefinition.toBeanName(annotation.ctor);
      switch (annotation.elementType) {
        case ElementType.TYPE:
          if (fallback && beanFactory.getBeanDefinition(beanName)) {
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
    this.registerBeanPostProcessor();
    this.registerAllComponentBeans();
    this.createSingletonBeans();
    this.registerAllComponentBeans(true);
    this.onFinish();
  }
}
