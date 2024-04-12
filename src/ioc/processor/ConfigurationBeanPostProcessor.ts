import { ClazzType } from "../../interface/declare";
import Scope from "../../servlets/annotations/Scope";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Bean from "../annotations/Bean";
import Configuration from "../annotations/Configuration";
import Qualifier from "../annotations/Qualifier";
import BeanDefinition from "../factory/BeanDefinition";
import { BeanFactory } from "../factory/BeanFactory";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

const beanInjectedSymbol = Symbol('beanInjected');
const beanNameSymbol = Symbol('beanName')

export default class ConfigurationBeanPostProcessor extends InstantiationAwareBeanPostProcessor {

  private readonly beanFactory: BeanFactory

  constructor(beanFactory: BeanFactory) {
    super();
    this.beanFactory = beanFactory;
  }

  /**
   * 注册组件的Bean注解定义
   * @param clazz 
   */
  private registerComponentBeanAnnotations(clazz: ClazzType) {
    if (clazz[beanInjectedSymbol] === true) return;
    clazz[beanInjectedSymbol] = true;
    const annotations = RuntimeAnnotation.getAnnotations(Bean, clazz);
    annotations.forEach((anno) => {
      const scopeAnno = RuntimeAnnotation.getMethodAnnotation(clazz, anno.methodName, Scope);
      const qualifier = RuntimeAnnotation.getMethodAnnotation(clazz, anno.methodName, Qualifier);
      const scope = scopeAnno?.nativeAnnotation?.scope;
      const definition = new BeanDefinition(clazz, anno.method, scope);
      const name = qualifier?.nativeAnnotation?.value || anno.methodName;
      anno.method[beanNameSymbol] = name;
      this.beanFactory.registerBeanDefinition(name, definition);
    });
  }

  postProcessBeforeInitialization(beanType: ClazzType, beanName: string): object {
    this.registerComponentBeanAnnotations(beanType);
    return null;
  }

  postProcessAfterInitialization(beanInstance: object, beanName: string): object {
    return beanInstance;
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: object, beanName: string): PropertyValue[] {
    return pvs;
  }

  postProcessFinish(beanInstance: object, beanType: ClazzType): void {
    if (beanInstance && !!RuntimeAnnotation.getAnnotation(Configuration, beanType)) {
      // 代理配置实例方法
      this.proxyConfigurationInstance(beanInstance, beanType);
    }
  }

  private proxyConfigurationInstance(proto: object, beanType: ClazzType) {
    const annotations = RuntimeAnnotation.getAnnotations(Bean, beanType);
    const beanFactory = this.beanFactory;
    annotations.forEach((anno) => {
      const name = anno.method[beanNameSymbol];
      proto[anno.methodName] = new Proxy(anno.method, {
        apply(handler: Function, thisArg, args) {
          return beanFactory.getBean(name);
        }
      });
      // 初始化方法bean
      beanFactory.getBean(name);
    })
  }
}