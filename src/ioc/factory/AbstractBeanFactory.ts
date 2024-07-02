import BeanCreationException from "../../errors/BeanCreationException";
import BeanPropertyCreationException from "../../errors/BeanPropertyCreationException";
import Exception from "../../errors/Exception";
import LoopDependenciesException, { DependencyBeanDefinition } from "../../errors/LoopDependenciesException";
import Javascript from "../../interface/Javascript";
import { ClazzType } from "../../interface/declare";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import RuntimeAnnotation, { } from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Autowired from "../annotations/Autowired";
import Qualifier from "../annotations/Qualifier";
import BeanPostProcessor from "../processor/BeanPostProcessor";
import InitializingBean from "../processor/InitializingBean";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "../processor/InstantiationAwareBeanPostProcessor";
import Aware from "./Aware";
import BeanDefinition from "./BeanDefinition";
import { BeanFactory } from "./BeanFactory";
import BeanFactoryAware from "./BeanFactoryAware";
import BeanNameAware from "./BeanNameAware";
import OrderedHelper from "./OrderedHelper";

export const isIocRemovedSymbol = Symbol('isIocRemoved');

export default abstract class AbstractBeanFactory implements BeanFactory {

  protected readonly id: number

  private readonly createChains: DependencyBeanDefinition[]

  constructor() {
    this.id = performance.now();
    this.createChains = [];
  }

  // bean处理器
  private readonly beanPostProcessors: BeanPostProcessor[] = []

  // bean实例缓存
  private readonly beanInstancesCache: Map<BeanDefinition, any> = new Map<BeanDefinition, any>()

  /**
   * 是否包含指定名称bean定义
   * @param key 
   */
  abstract containsBeanDefinition(beanName: string)

  /**
   * 根据bean名称获取对应的定义
   * @param beanName bean类型
   */
  abstract getBeanDefinition(beanName: string): BeanDefinition

  /**
   * 注册一个bean
   * @param beanName bean名称 
   * @param beanDefinition bean定义
   */
  abstract registerBeanDefinition(beanName: string, beanDefinition: BeanDefinition)

  /**
   * 移除bean定义
   */
  abstract removeBeanDefinition(beanName: string)

  /**
   * 获取所有已注册的bean定义key
   */
  abstract getBeanDefinitionNames(): IterableIterator<string>

  /**
   * 判断传入名称的bean是否为单例
   * @param key 
   */
  isSingleton(key: string): boolean {
    return this.getBeanDefinition(key)?.scope === 'singleton';
  }

  /**
   * 判断传入名称的bean是否为原型
   * @param key 
   */
  isPrototype(key: string): boolean {
    return this.getBeanDefinition(key)?.scope === 'prototype';
  }

  /**
   * 指定指定名称的bean构造函数或者类
   * @param name 
   */
  getType(name: string) {
    const definition = this.getBeanDefinition(name);
    const clazz = definition?.clazz;
    if (definition && !definition.clazz) {
      // 如果是函数来构造bean，在不显示设置返回类型时 无法获取returnType 则需要获取实例后，再获取类型
      const bean = this.doGetBean(definition, name, true);
      bean && definition.fallbackBeanType(bean.constructor as ClazzType);
    }
    return clazz;
  }

  /**
   * 是否包含指定名称的bean
   * @param key 
   * @returns 
   */
  containsBean(key: string) {
    return this.containsBeanDefinition(key);
  }

  /**
   * 判定指定名称Bean是为beanType参数指定的类型
   * @param beanName bean定义名
   * @param espectBeanType 预期的bean类型
   */
  isTypeMatch(beanName: string, beanType: ClazzType) {
    const clazz = this.getType(beanName);
    return Javascript.createTyper(clazz).isType(beanType);
  }

  /**
   * 获取指定bean实例
   */
  getBean<T = any>(name: ClazzType | string): T {
    const beanName = BeanDefinition.toBeanName(name);
    const definition = this.getBeanDefinition(beanName);
    let instance: T = null;
    if (definition) {
      instance = this.doGetBean<T>(definition, beanName);
      // throw new BeanDefinitionNotfoundException(name);  
    }
    this.debug('GetBean ', beanName, instance ? 'ok' : 'fail');
    return instance;
  }

  getBeanOfType<T extends abstract new () => any>(beanType: T) {
    const result: InstanceType<T>[] = [];
    for (const beanInstance of this.beanInstancesCache.values()) {
      if (Javascript.createTyper(beanInstance.constructor).isType(beanType)) {
        result.push(beanInstance);
      }
    }
    return OrderedHelper.sort(result);
  }

  /**
   * 根据Bean定义创建Bean实例
   * @param definition Bean定义
   * @returns Bean的实例对象
   */
  private doGetBean<T>(definition: BeanDefinition, beanName: string, saveInstance = false) {
    const isSingleton = this.isSingleton(beanName);
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
    beanInstance = this.createBean(definition, beanName) as T;
    if (beanInstance && needSaveInstance) {
      this.beanInstancesCache.set(definition, beanInstance);
    }
    return beanInstance;
  }

  private createBean(definition: BeanDefinition, beanName: string) {
    try {
      // 1. 执行预创建实例化事件，如果有返回对象，则直接结束创建
      const beanInstance = this.resolveBeforeInstantiation(definition, beanName);
      if (beanInstance) {
        return beanInstance;
      }
    } catch (ex) {
      throw new BeanCreationException(definition, beanName, `BeanPostProcessor before instantiation of bean failed`, ex);
    }
    return this.doCreateBean(definition, beanName)
  }

  private checkLoopDependencies(definition: BeanDefinition, beanName: string) {
    if (!!this.createChains.find((m) => m.definition == definition)) {
      const chains = this.createChains;
      throw new LoopDependenciesException(chains);
    }
    this.createChains.push({ beanName: beanName, definition });
  }

  private doCreateBean(definition: BeanDefinition, beanName: string) {
    try {
      // 检测循环依赖
      this.checkLoopDependencies(definition, beanName);
      // 2. 根据定义创建实例
      const beanInstance = this.createInstance(definition);
      this.populateBean(beanInstance, beanName, definition);
      const instance = this.initializeBean(beanInstance, beanName);
      return instance;
    } catch (ex) {
      if (ex instanceof Exception) {
        throw ex;
      }
      throw new BeanCreationException(definition, beanName, `Unexpected exception during bean creation`, ex);
    } finally {
      // 创建实例成功后，重置检测变量
      this.createChains.pop();
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
    let instance = {};
    const ownerClazz = definition.methodClazz;
    const clazzBeanName = BeanDefinition.toBeanName(ownerClazz);
    if (this.getBeanDefinition(clazzBeanName) !== definition) {
      // 需要先创建类实例
      instance = this.getBean(clazzBeanName);
    }
    // 创建函数bean
    const handler = definition.method;
    const annotations = RuntimeAnnotation.getAnnotations([Qualifier, Autowired], ownerClazz);
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
    // 1.1 实例化bean
    let beanInstance = this.applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
    if (beanInstance) {
      // 1.2 执行初始化结束事件
      beanInstance = this.applyBeanPostProcessorsAfterInitialization(beanInstance, beanName);
    }
    return beanInstance;
  }

  /**
   * 执行实例化before事件
   * @param targetType 当前bean类
   * @param beanName 当前bean名称
   * @returns 返回预创建创建的实例如果有的话
   */
  private applyBeanPostProcessorsBeforeInstantiation(targetType: ClazzType, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      const instance = processor.postProcessBeforeInstantiation(targetType, beanName);
      if (instance != null) {
        return instance;
      }
    }
  }

  /**
   * 执行实例化after事件
   * @param instance 当前bean实例
   * @param beanName 当前bean名称
   * @returns 
   */
  private applyBeanPostProcessorsAfterInstantiation(instance: object, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      const isSkip = !processor.postProcessAfterInstantiation(instance, beanName);
      if (isSkip) {
        return isSkip;
      }
    }
  }

  /**
   * 执行初始化before事件
   * @param instance 当前bean实例
   * @param beanName 当前bean名称
   * @returns 要导出的bean实例
   */
  private applyBeanPostProcessorsBeforeInitialization(instance: object, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    let beanInstance = instance;
    for (const processor of processors) {
      const current = processor.postProcessBeforeInitialization(beanInstance, beanName);
      if (current) {
        beanInstance = current;
      }
    }
    return beanInstance;
  }

  /**
   * 执行初始化结束事件
   * @param instance 当前bean实例
   * @param beanName 当前bean名称
   * @returns 要导出的bean实例
   */
  private applyBeanPostProcessorsAfterInitialization(instance: object, beanName: string) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    let beanInstance = instance;
    for (const processor of processors) {
      const current = processor.postProcessAfterInitialization(beanInstance, beanName);
      if (current) {
        beanInstance = current;
      }
    }
    return beanInstance;
  }

  private applyBeanPostProperties(pvs: PropertyValue[], beanInstance: object, beanName: string, definition: BeanDefinition) {
    const processors = this.getProcessors(InstantiationAwareBeanPostProcessor);
    for (const processor of processors) {
      pvs = processor.postProcessProperties(pvs, beanInstance, beanName, definition);
    }
    return pvs;
  }

  private populateBean(beanInstance: object, beanName: string, definition: BeanDefinition) {
    // 2.1 执行实例化after事件
    const isSkip = this.applyBeanPostProcessorsAfterInstantiation(beanInstance, beanName);
    if (isSkip) {
      // 如果忽略属性设置
      return;
    }
    // 2.2 执行处理实例属性事件
    const properties = this.applyBeanPostProperties([], beanInstance, beanName, definition);
    properties.forEach((p) => {
      const value = p.value;
      if (p.optional === false && (value === null || value === undefined)) {
        throw new BeanPropertyCreationException(definition, beanName, p.name, 'get bean null');
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
  }

  private invokeAwareMethods(beanInstance: object, beanName: string) {
    if (!(beanInstance instanceof Aware)) return;
    if (beanInstance instanceof BeanNameAware) {
      beanInstance.setBeanName(beanName);
    } else if (beanInstance instanceof BeanFactoryAware) {
      beanInstance.setBeanFactory(this);
    }
  }

  private invokeInitMethods(beanInstance: object, beanName: string) {
    (beanInstance as InitializingBean).afterPropertiesSet?.();
  }

  private initializeBean(beanInstance: object, beanName: string) {
    // 2.3 处理初始化前事件
    this.applyBeanPostProcessorsBeforeInitialization(beanInstance, beanName);
    // 2.4 执行不同类型的实例属性注入
    this.invokeAwareMethods(beanInstance, beanName);
    // 2.5 执行实例初始化函数
    this.invokeInitMethods(beanInstance, beanName);
    // 2.6 执行初始化after事件
    return this.applyBeanPostProcessorsAfterInitialization(beanInstance, beanName);
  }

  /**
   * 添加一个或多个bean处理器
   */
  addBeanPostProcessor(...processors: BeanPostProcessor[]): void {
    this.beanPostProcessors.push(...processors);
  }

  removeBeanInstance(beanType: ClazzType): void {
    const beanName = BeanDefinition.toBeanName(beanType);
    const definition = this.getBeanDefinition(beanName);
    const instance = this.beanInstancesCache.get(definition);
    this.beanInstancesCache.delete(definition);
    if (instance) {
      instance[isIocRemovedSymbol] = true;
    }
  }

  protected debug(...args: any[]) {
    // console.debug(`BeanFactory[${this.id}]:`, ...args);
  }

  /**
   * 销毁工厂
   */
  destory() {
    this.beanInstancesCache.clear();
  }
}