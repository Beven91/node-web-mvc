import Method from "../interface/Method";
import OrderedHelper from "../ioc/factory/OrderedHelper";
import Advice from "./advice/Advice";
import PointcutAdvisor from "./advisor/PointcutAdvisor";
import ReflectiveMethodInvocation from "./invocation/ReflectiveMethodInvocation";

export default class CglibAopProxy {

  private advisors: PointcutAdvisor[]

  constructor() {
    this.advisors = [];
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
    return OrderedHelper.sort(interceptors);
  }

  setAdvisors(advisors: PointcutAdvisor[]) {
    this.advisors = advisors || [];
  }

  intercept(proxy: object, target: object, method: Method, args: any[]) {
    const chain = this.createChain(method);
    return new ReflectiveMethodInvocation(proxy, target, method, args, chain).processed();
  }
}