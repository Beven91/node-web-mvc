import CglibAopProxy from "../../aop/CglibAopProxy";
import PointcutAdvisor from "../../aop/advisor/PointcutAdvisor";
import Method from "../../interface/Method";
import { ClazzType } from "../../interface/declare";
import Tracer from "../../servlets/annotations/annotation/Tracer";
import { BeanFactory } from "../factory/BeanFactory";
import InstantiationAwareBeanPostProcessor from "./InstantiationAwareBeanPostProcessor";
import hot from 'nodejs-hmr';

const blacklist = {
  'constructor': true
}

export default class CglibAopProxyPostProcesor extends InstantiationAwareBeanPostProcessor {

  private readonly aopProxy: CglibAopProxy

  private readonly advisorBeans: PointcutAdvisor[]

  constructor(beanFactory: BeanFactory) {
    super();
    this.aopProxy = new CglibAopProxy();
    this.advisorBeans = [];
    registerHotUpdate(this.advisorBeans, beanFactory);
  }

  getAopProxy() {
    this.aopProxy.setAdvisors(this.advisorBeans);
    return this.aopProxy;
  }

  postProcessAfterInitialization(beanInstance: object, beanName: string): object {
    if (beanInstance instanceof PointcutAdvisor) {
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

function registerHotUpdate(advisorBeans: PointcutAdvisor[], beanFactory: BeanFactory) {
  hot
    .create(module)
    .clean()
    .preload((old) => {
      const removeInstances = [];
      for (let key of beanFactory.getBeanDefinitionNames()) {
        const definition = beanFactory.getBeanDefinition(key);
        const ctor = definition.clazz || definition.methodClazz;
        if (Tracer.isDependency?.(ctor, old.filename)) {
          removeInstances.push(beanFactory.getBean(key).constructor)
        }
      }
      const remainings = advisorBeans.filter((m) => !removeInstances.find((k) => k == m.constructor));
      advisorBeans.length = 0;
      advisorBeans.push(...remainings);
    })
}