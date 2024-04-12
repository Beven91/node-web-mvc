import CglibAopProxy from "../../aop/CglibAopProxy";
import PointcutAdvisor from "../../aop/advisor/PointcutAdvisor";
import Method from "../../interface/Method";
import { ClazzType } from "../../interface/declare";
import InstantiationAwareBeanPostProcessor from "./InstantiationAwareBeanPostProcessor";

const blacklist = {
  'constructor': true
}

export default class CglibAopProxyPostProcesor extends InstantiationAwareBeanPostProcessor {

  private readonly aopProxy: CglibAopProxy

  private readonly advisorBeans: PointcutAdvisor[]

  constructor() {
    super();
    this.aopProxy = new CglibAopProxy();
    this.advisorBeans = [];
  }

  getAopProxy(){
    this.aopProxy.setAdvisors(this.advisorBeans);
    return this.aopProxy;
  }

  postProcessAfterInitialization(beanInstance: object, beanName: string): object {
    if(beanInstance instanceof PointcutAdvisor) {
      this.advisorBeans.push(beanInstance);
    }
    return this.proxyInstance(beanInstance, beanInstance.constructor);
  }

  private proxyInstance(beanInstance: object, beanType: Function) {
    if (!beanInstance) {
      return beanInstance;
    }
    const scope = this;
    const proxy = new Proxy(beanInstance, {
      get(target, p) {
        const value = target[p];
        if (typeof value === 'function' && !blacklist[p]) {
          return new Proxy(value, {
            apply(handler: Function, thisArg, args) {
              const aopProxy = scope.getAopProxy();
              const method = new Method(handler, beanType as ClazzType);
              return aopProxy.intercept(proxy, thisArg, method, args);
            }
          })
        }
        return value;
      },
    })
    return proxy;
  }
}