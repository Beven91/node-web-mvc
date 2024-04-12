import BeanCreationException from "../../errors/BeanCreationException";
import BeanPropertyCreationException from "../../errors/BeanPropertyCreationException";
import Javascript from "../../interface/Javascript";
import { ClazzType } from "../../interface/declare";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import RuntimeAnnotation, { } from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Ordered from "../../servlets/context/Ordered";
import Autowired from "../annotations/Autowired";
import Qualifier from "../annotations/Qualifier";
import BeanPostProcessor from "../processor/BeanPostProcessor";
import InitializingBean from "../processor/InitializingBean";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "../processor/InstantiationAwareBeanPostProcessor";
import BeanDefinition from "./BeanDefinition";
import { BeanDefinitonKey } from "./BeanDefinitionRegistry";
import { BeanFactory } from "./BeanFactory";

export default abstract class AbstractBeanFactory implements BeanFactory {
  // bean处理器
  private readonly beanPostProcessors: BeanPostProcessor[] = []

  // bean实例缓存
  private readonly beanInstancesCache: Map<BeanDefinition, any> = new Map<BeanDefinition, any>()

  /**
   * 是否包含指定名称bean定义
   * @param key 
   */
  abstract containsBeanDefinition(key: BeanDefinitonKey)

  /**
   * 根据beanType名称或者类型获取对应的bean定义信息
   * @param beanType bean类型
   */
  abstract getBeanDefinition(beanType: BeanDefinitonKey): BeanDefinition

  /**
   * 注册一个bean
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  abstract registerBeanDefinition(beanName: BeanDefinitonKey, beanDefinition: BeanDefinition)

  /**
   * 移除bean定义
   */
  abstract removeBeanDefinition(beanName: BeanDefinitonKey)

  /**
   * 获取所有已注册的bean定义key
   */
  abstract getBeanDefinitionNames(): IterableIterator<BeanDefinitonKey>

  /**
   * 判断传入名称的bean是否为单例
   * @param key 
   */
  isSingleton(key: BeanDefinitonKey): boolean {
    return this.getBeanDefinition(key)?.scope === 'singleton';
  }

  /**
   * 判断传入名称的bean是否为原型
   * @param key 
   */
  isPrototype(key: BeanDefinitonKey): boolean {
    return this.getBeanDefinition(key)?.scope === 'prototype';
  }

  /**
   * 指定指定名称的bean构造函数或者类
   * @param name 
   */
  getType(name: BeanDefinitonKey) {
    const definition = this.getBeanDefinition(name);
    if (!definition.clazz) {
      // 如果是函数来构造bean，在不显示设置返回类型时 无法获取returnType 则需要获取实例后，再获取类型
      const bean = this.doGetBean(definition, name, true);
      bean && definition.fallbackBeanType(bean.constructor as ClazzType);
    }
    return definition?.clazz;
  }

  /**
   * 是否包含指定名称的bean
   * @param key 
   * @returns 
   */
  containsBean(key: BeanDefinitonKey) {
    return this.containsBeanDefinition(key);
  }

  /**
   * 判定指定名称Bean是为beanType参数指定的类型
   * @param beanName bean定义名
   * @param espectBeanType 预期的bean类型
   */
  isTypeMatch(beanName: BeanDefinitonKey, beanType: ClazzType) {
    const clazz = this.getType(beanName);
    return Javascript.getClass(clazz).isEqualOrExtendOf(beanType);
  }

  /**
   * 获取指定bean实例
   */
  getBean<T = any>(beanType: ClazzType): T;
  getBean<T = any>(name: string, ...args: any[]): T;
  getBean<T = any>(...args: any): T;
  getBean<T = any>(name: BeanDefinitonKey) {
    const definition = this.getBeanDefinition(name);
    if (!definition) {
      return null;
      // throw new BeanDefinitionNotfoundException(name);  
    }
    return this.doGetBean<T>(definition, name);
  }

  getBeanOfType<T extends abstract new () => any>(beanType: T) {
    const result: InstanceType<T>[] = [];
    for (const beanInstance of this.beanInstancesCache.values()) {
      if (Javascript.getClass(beanInstance.constructor).isEqualOrExtendOf(beanType)) {
        result.push(beanInstance);
      }
    }
    result.sort((a, b) => {
      const o1 = (a as Ordered).getOrder?.() || Number.MAX_SAFE_INTEGER;
      const o2 = (b as Ordered).getOrder?.() || Number.MAX_SAFE_INTEGER;
      return o2 - o1;
    })
    return result;
  }

  /**
   * 根据Bean定义创建Bean实例
   * @param definition Bean定义
   * @param args 额外的构造参数 .... TODO 是否有必要保留?
   * @returns Bean的实例对象
   */
  private doGetBean<T>(definition: BeanDefinition, key: BeanDefinitonKey, saveInstance = false) {
    const isSingleton = this.isSingleton(key);
    const needSaveInstance = isSingleton || saveInstance === true;
    let beanInstance = this.beanInstancesCache.get(definition) as T;
    if (!isSingleton) {
      // 为了补充getType分支，这里为了不浪费实例会设置saveInstance=true,在获取后会需要移除掉，在非单例模式下
      this.beanInstancesCache.delete(definition);
    }
    if (beanInstance) {
      // 返回缓存对象
      return beanInstance;
    }
    beanInstance = this.createBean(definition, key) as T;
    if (beanInstance && needSaveInstance) {
      this.beanInstancesCache.set(definition, beanInstance);
    }
    this.applyBeanPostProcessorsFinishInstantiation(beanInstance as object, beanInstance?.constructor as ClazzType)
    return beanInstance;
  }

  private createBean(definition: BeanDefinition, key: BeanDefinitonKey) {
    const beanName = typeof key === 'string' ? key : key?.name;
    let beanInstance = null;
    try {
      beanInstance = this.resolveBeforeInstantiation(definition, beanName);
      if (beanInstance) {
        return beanInstance;
      }
    } catch (ex) {
      throw new BeanCreationException(definition, beanName, `BeanPostProcessor before instantiation of bean failed`, ex);
    }
    try {
      beanInstance = this.createInstance(definition);
      this.populateBean(beanInstance, beanName);
      return beanInstance;
    } catch (ex) {
      throw new BeanCreationException(definition, beanName, `Unexpected exception during bean creation`, ex);
    }
  }

  private createInstance(definition: BeanDefinition) {
    if (definition.method) {
      return this.createInstanceByMethod(definition);
    }
    const Bean = definition.clazz;
    return new Bean();
  }

  private createInstanceByMethod(definition: BeanDefinition) {
    const methodClazz = definition.methodClazz;
    const methodDefinition = this.getBeanDefinition(methodClazz);
    let instance = {};
    if (methodDefinition !== definition) {
      instance = this.getBean(methodClazz);
    }
    const handler = definition.method;
    const annotations = RuntimeAnnotation.getAnnotations([Qualifier, Autowired], methodClazz);
    const parameters = annotations.filter((m) => m.elementType == ElementType.PARAMETER && m.method == handler);
    const values = parameters.map((parameter) => {
      const x = parameter.nativeAnnotation as InstanceType<typeof Qualifier>;
      return this.getBean(x.value || parameter.paramType);
    });
    return handler.apply(instance, values);
  }

  private getProcessors<T extends abstract new (...args: any[]) => any>(processorType: T) {
    const processors = this.beanPostProcessors.filter((m) => m instanceof processorType);
    return processors as InstanceType<T>[];
  }

  private resolveBeforeInstantiation(definition: BeanDefinition, beanName: string) {
    const targetType = definition.clazz;
    const beanInstance = this.applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
    if (beanInstance !== null) {
      this.applyBeanPostProcessorsAfterInitialization(beanInstance, beanName);
    }
    return beanInstance;
  }

  private applyBeanPostProcessorsBeforeInstantiation(targetType: ClazzType, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      const instance = processor.postProcessBeforeInitialization(targetType, beanName);
      if (instance != null) {
        return instance;
      }
    }
  }

  private applyBeanPostProcessorsFinishInstantiation(beanInstance: object, beanType: ClazzType) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      processor.postProcessFinish(beanInstance, beanType);
    }
  }

  private applyBeanPostProcessorsAfterInitialization(instance: object, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      processor.postProcessAfterInitialization(instance, beanName);
    }
  }

  private applyBeanPostProperties(pvs: PropertyValue[], beanInstance: object, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      pvs = processor.postProcessProperties(pvs, beanInstance, beanName);
    }
    return pvs;
  }

  private populateBean(beanInstance: object, beanName: string) {
    this.applyBeanPostProcessorsAfterInitialization(beanInstance, beanName);
    const properties = this.applyBeanPostProperties([], beanInstance, beanName);
    properties.forEach((p) => {
      const value = p.value;
      if (p.optional === false && (value === null || value === undefined)) {
        throw new BeanPropertyCreationException(beanName, p.name);
      }
      if (typeof value === 'function') {
        // 如果是一个函数，则表示用作getter 可用于解决循环依赖
        Object.defineProperty(beanInstance, p.name, {
          get() {
            return value();
          }
        })

      } else {
        beanInstance[p.name] = value;
      }
    });

    const initializing = beanInstance as InitializingBean;
    initializing.afterPropertiesSet?.();
  }

  /**
   * 添加一个或多个bean处理器
   */
  addBeanPostProcessor(...processors: BeanPostProcessor[]): void {
    this.beanPostProcessors.push(...processors);
  }

  removeBeanInstance(beanName: BeanDefinitonKey): void {
    const definition = this.getBeanDefinition(beanName);
    this.beanInstancesCache.delete(definition);
  }
}