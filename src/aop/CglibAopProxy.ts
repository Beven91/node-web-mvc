import Method from "../interface/Method";
import { ClazzType } from "../interface/declare";
import { BeanFactory } from "../ioc/factory/BeanFactory";
import Advice from "./advice/Advice";
import PointcutAdvisor from "./advisor/PointcutAdvisor";
import ReflectiveMethodInvocation from "./invocation/ReflectiveMethodInvocation";

export default class CglibAopProxy {

  private advisors: PointcutAdvisor[]

  constructor(beanFactory: BeanFactory) {
    this.advisors = beanFactory.getBeanOfType(PointcutAdvisor);
  }

  createChain(method: Method) {
    const interceptors: Advice[] = [];
    for (const advisor of this.advisors) {
      const pointcut = advisor.getPointcut();
      const advice = advisor.getAdvice();
      if (pointcut?.matches?.(method.clazz, method)) {
        interceptors.push(advice);
      }
    }
    return interceptors;
  }

  intercept(proxy: object, target: object, method: Method, args: any[]) {
    const chain = this.createChain(method);
    return new ReflectiveMethodInvocation(proxy, target, method, args, chain).processed();
  }
}