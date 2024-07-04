import { ClazzType } from "../../interface/declare";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Bean from "../annotations/Bean";
import Configuration from "../annotations/Configuration";
import { BeanFactory } from "../factory/BeanFactory";
import { methodBeanNameSymbol } from "../factory/DefaultListableBeanFactory";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

export default class ConfigurationBeanPostProcessor extends InstantiationAwareBeanPostProcessor {

  private readonly beanFactory: BeanFactory

  constructor(beanFactory: BeanFactory) {
    super();
    this.beanFactory = beanFactory;
  }

  postProcessBeforeInitialization(beanType: ClazzType, beanName: string): object {
    return null;
  }

  postProcessAfterInitialization(beanInstance: object, beanName: string): object {
    const beanType = beanInstance?.constructor as ClazzType;
    if (beanInstance && RuntimeAnnotation.hasClassAnnotation(beanType, Configuration)) {
      // 代理配置实例方法
      this.proxyConfigurationInstance(beanInstance, beanType);
    }
    return beanInstance;
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: object, beanName: string): PropertyValue[] {
    return pvs;
  }

  private proxyConfigurationInstance(proto: object, beanType: ClazzType) {
    const annotations = RuntimeAnnotation.getAnnotations(Bean, beanType);
    const beanFactory = this.beanFactory;
    annotations.forEach((anno) => {
      const name = anno.method[methodBeanNameSymbol];
      proto[anno.methodName] = new Proxy(anno.method, {
        apply() {
          return beanFactory.getBean(name);
        }
      });
    })
  }
}