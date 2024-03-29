/**
 * @module DefaultListableBeanFactory
 * @description Ioc 容器
 */
import hot from "nodejs-hmr";
import BeanDefinition from "./BeanDefinition";
import ObjectProvider from "../provider/ObjectProvider";
import SingletonBeanProvider from '../provider/SingletonBeanProvider';
import RequestBeanProvider from "../provider/RequestBeanProvider";
import PrototypeBeanProvider from "../provider/PrototypeBeanProvider";
import RuntimeAnnotation, { TracerConstructor } from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Component from "../annotations/Component";
import BeanOptions from "../annotations/BeanOptions";
import AbstractBeanFactory from "./AbstractBeanFactory";

export default class DefaultListableBeanFactory extends AbstractBeanFactory {
  /**
   * 已注册bean定义字典
   */
  private readonly beanDefinitions = new Map<string | Function, BeanDefinition>();

  // bean提供者
  private readonly providers = new Map<string, ObjectProvider>();

  constructor() {
    super();
    this.providers.set('prototype', new PrototypeBeanProvider());
    this.providers.set('singleton', new SingletonBeanProvider());
    this.providers.set('request', new RequestBeanProvider());
    hotUpdate(this.beanDefinitions, this.providers, this.registerWithAnnotation);
  }

  protected containsBeanDefinition(key: string) {
    return !!this.getBeanDefinition(key);
  }

  /**
   * 根据beanType名称或者类型获取对应的bean定义信息
   * @param beanType bean类型
   */
  getBeanDefinition(name: string | Function): BeanDefinition {
    return this.beanDefinitions.get(name);
  }

  /**
   * 根据传入bean获取对应的provider
   * @param beanType 
   */
  getBeanProvider(beanType: string | Function): ObjectProvider {
    const deifnition = this.getBeanDefinition(beanType);
    return this.providers.get(deifnition.scope);
  }

  /**
   * 注册一个bean
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  registerBeanDefinition(beanName: string | Function, beanDefinition: BeanDefinition, safe = false) {
    if (this.beanDefinitions.get(beanName)) {
      if (!safe) {
        throw new Error(`已存在同名的Bean:${beanName}`);
      }
    }
    this.beanDefinitions.set(beanName, beanDefinition);
  }

  /**
   * 根据注解注册Bean定义
   * @param annotation Component注解
   */
  private registerWithAnnotation(annotation: RuntimeAnnotation<InstanceType<typeof Component>>) {
    const definition = new BeanDefinition(annotation.ctor);
    const name = annotation.nativeAnnotation.value;
    if (name) {
      this.registerBeanDefinition(name, definition);
    }
    this.registerBeanDefinition(BeanOptions.toBeanName(definition.clazz.name), definition);
    this.registerBeanDefinition(annotation.ctor, definition);
  }

  /**
   * 扫描注册所有bean
   */
  registerAllBeans() {
    const annotations = RuntimeAnnotation.getAnnotations(Component);
    annotations.forEach((annotation) => {
      this.registerWithAnnotation(annotation);
    });
  }
}

// 开发模式热更新
function hotUpdate(
  beanDefinitions: DefaultListableBeanFactory['beanDefinitions'],
  providers: DefaultListableBeanFactory['providers'],
  registerWithAnnotation: DefaultListableBeanFactory['registerWithAnnotation']
) {
  const updateFiles: string[] = [];
  const removeKeys: any[] = [];
  hot
    .create(module)
    .preload((old) => {
      updateFiles.push(old.filename);
      beanDefinitions.forEach((definition, key) => {
        const octor = definition.clazz as TracerConstructor;
        if (octor?.tracer?.isDependency?.(old.filename)) {
          // 记录需要移除的内容
          removeKeys.push(key);
        }
      });
    })
    .postend(() => {
      console.log('removeKeys', removeKeys);
      removeKeys.forEach((key) => {
        const definition = beanDefinitions.get(key);
        // 移除Bean定义
        beanDefinitions.delete(key);
        const provider = providers.get(definition.scope);
        // 移除Bean定义对应的实例对象
        provider.removeInstancesByClazz(definition.clazz);
      })
      const annotations = RuntimeAnnotation.getAnnotations(Component);
      annotations.forEach((annotation) => {
        const ctor = annotation.ctor as TracerConstructor;
        if (!ctor?.tracer) return;
        if (updateFiles.find((file) => ctor.tracer.isDependency(file))) {
          console.log('register:', annotation.ctor.name);
          // 重新注册热更新过的Bean定义
          registerWithAnnotation(annotation);
        }
      });
    })
}