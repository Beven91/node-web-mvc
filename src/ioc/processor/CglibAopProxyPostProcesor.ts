import CglibAopProxy from "../../aop/CglibAopProxy";
import Method from "../../interface/Method";
import { ClazzType } from "../../interface/declare";
import { BeanFactory } from "../factory/BeanFactory";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

export default class CglibAopProxyPostProcesor extends InstantiationAwareBeanPostProcessor {

  private readonly aopProxy: CglibAopProxy

  constructor(beanFactory: BeanFactory) {
    super();
    this.aopProxy = new CglibAopProxy(beanFactory);
  }

  postProcessBeforeInitialization(beanType: ClazzType, beanName: string): object {
    return null;
  }

  postProcessAfterInitialization(beanInstance: object, beanName: string): object {
    return this.proxyInstance(beanInstance, beanInstance.constructor);
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: object, beanName: string): PropertyValue[] {
    return pvs;
  }

  private proxyInstance(beanInstance: object, beanType: Function) {
    if (!beanInstance) {
      return beanInstance;
    }
    const aopProxy = this.aopProxy;
    const proxy = new Proxy(beanInstance, {
      get(target, p) {
        const value = target[p];
        if (typeof value === 'function') {
          return new Proxy(value, {
            apply(handler: Function, thisArg, args) {
              const method = new Method(handler, beanType as ClazzType);
              return aopProxy.intercept(proxy, thisArg, method, args);
            }
          })
        }
        return value;
      },
    })
  }
}