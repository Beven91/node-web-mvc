/**
 * @CglibAopProxyPostProcesor
 * 动态代理，可用于实现aop
 */
import CglibAopProxy from '../../aop/CglibAopProxy';
import PointcutAdvisor from '../../aop/advisor/PointcutAdvisor';
import Aspect from '../../aop/annotations/Aspect';
import Method from '../../interface/Method';
import { ClazzType } from '../../interface/declare';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import { BeanFactory } from '../factory/BeanFactory';
import ProxyHelper from '../factory/ProxyHelper';
import InstantiationAwareBeanPostProcessor from './InstantiationAwareBeanPostProcessor';

const blacklist = {
  'constructor': true,
};

export default class CglibAopProxyPostProcesor extends InstantiationAwareBeanPostProcessor {
  private readonly aopProxy: CglibAopProxy;

  constructor(beanFactory: BeanFactory) {
    super();
    this.aopProxy = new CglibAopProxy(beanFactory);
  }

  getAopProxy() {
    return this.aopProxy;
  }

  postProcessAfterInitialization(beanInstance: object, beanName: string): object {
    const hasAspect = RuntimeAnnotation.hasClassAnnotation(beanInstance.constructor, Aspect);
    if (beanInstance instanceof PointcutAdvisor || hasAspect) {
      return beanInstance;
    }
    return this.proxyInstance(beanInstance, beanInstance.constructor);
  }

  private proxyInstance(beanInstance: object, beanType: Function) {
    if (!beanInstance) {
      return beanInstance;
    }
    const scope = this;
    const proxy = new Proxy(beanInstance, {
      get(target: object, p: string | symbol, receiver: any) {
        const value = Reflect.get(target, p, receiver);
        if (ProxyHelper.isInstanceSymbol(p)) {
          return target;
        }
        if (typeof value === 'function' && !blacklist[p]) {
          // 这里之所以使用新建一个Proxy拦截apply是不希望改完返回的value,如果新生成一个value会导致一些标记在函数上的注解无法获取
          return new Proxy(value, {
            apply(handler: Function, thisArg, args) {
              const aopProxy = scope.getAopProxy();
              const method = new Method(handler, beanType as ClazzType);
              // 这里之所以不使用thisArg 是因为在类的内部调用对应的函数不希望被代理拦截
              return aopProxy.intercept(proxy, target, method, args);
            },
          });
        }
        return value;
      },
    });
    return proxy;
  }
}
