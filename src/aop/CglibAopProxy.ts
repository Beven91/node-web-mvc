import Method from '../interface/Method';
import { BeanFactory } from '../ioc/factory/BeanFactory';
import OrderedHelper from '../ioc/factory/OrderedHelper';
import RuntimeAnnotation from '../servlets/annotations/annotation/RuntimeAnnotation';
import { NewableMethodAdviceInterceptor } from './advice/AbstractMethodAdviceInterceptor';
import Advice from './advice/Advice';
import MethodAfterReturningAdviceInterceptor from './advice/MethodAfterReturningAdviceInterceptor';
import MethodAfterThrowingAdviceInterceptor from './advice/MethodAfterThrowingAdviceInterceptor';
import MethodAfterAdviceInterceptor from './advice/MethodAfterAdviceInterceptor';
import MethodBeforeAdviceInterceptor from './advice/MethodBeforeAdviceInterceptor';
import DefaultPointcutAdvisor from './advisor/DefaultPointcutAdvisor';
import PointcutAdvisor from './advisor/PointcutAdvisor';
import After from './annotations/After';
import AfterReturning from './annotations/AfterReturning';
import AfterThrowing from './annotations/AfterThrowing';
import Aspect from './annotations/Aspect';
import Before from './annotations/Before';
import ReflectiveMethodInvocation from './invocation/ReflectiveMethodInvocation';
import FunctionExpressionPointcut from './pointcut/FunctionExpressionPointcut';
import Pointcut from './pointcut/Pointcut';
import hot from 'nodejs-hmr';

export default class CglibAopProxy {
  private advisors: PointcutAdvisor[];

  private beanFactory: BeanFactory;

  constructor(beanFactory: BeanFactory) {
    this.beanFactory = beanFactory;
    registerHotUpdate(this.registerAllAdvisorts.bind(this));
  }

  private registerAllAdvisorts() {
    this.advisors = [];
    const allInstances = this.beanFactory.getBeansOfType(Object);
    for (const instance of allInstances) {
      if (instance instanceof PointcutAdvisor) {
        this.advisors.push(instance);
        continue;
      }
      // 注册aspect注解类型的advisor
      const aspect = RuntimeAnnotation.getClassAnnotation(instance.constructor, Aspect)?.nativeAnnotation;
      if (aspect) {
        this.registerAspectAdvisors(aspect, instance);
      }
    }
  }

  private registerAspectAdvisors(aspect: InstanceType<typeof Aspect>, instance: object) {
    const clazz = instance.constructor;
    const beforeAnnos = RuntimeAnnotation.getAnnotations(Before, clazz);
    const afterAnnos = RuntimeAnnotation.getAnnotations(After, clazz);
    const afterReturnAnnos = RuntimeAnnotation.getAnnotations(AfterReturning, clazz);
    const afterThrowingAnnos = RuntimeAnnotation.getAnnotations(AfterThrowing, clazz);
    this.registerAspectAdvisor(beforeAnnos, instance, MethodBeforeAdviceInterceptor);
    this.registerAspectAdvisor(afterAnnos, instance, MethodAfterAdviceInterceptor);
    this.registerAspectAdvisor(afterReturnAnnos, instance, MethodAfterReturningAdviceInterceptor);
    this.registerAspectAdvisor(afterThrowingAnnos, instance, MethodAfterThrowingAdviceInterceptor);
  }

  private registerAspectAdvisor(annos: RuntimeAnnotation<{ value?: Pointcut['matches'], [x: string]: any }>[], instance: object, Interceptor: NewableMethodAdviceInterceptor) {
    annos.forEach((anno) => {
      const handler = anno.method.bind(instance);
      const functionPointcut = new FunctionExpressionPointcut();
      const advisor = new DefaultPointcutAdvisor();
      functionPointcut.setExpression(anno.nativeAnnotation.value);
      advisor.setPointcut(functionPointcut);
      advisor.setAdvice(new Interceptor(handler));
      this.addAdvisor(advisor);
    });
  }

  private tryRegistryAllAdvisors() {
    if (!this.advisors) {
      this.registerAllAdvisorts();
    }
    return this.advisors;
  }

  private createChain(method: Method) {
    const interceptors: Advice[] = [];
    const advisors = this.tryRegistryAllAdvisors();
    for (const advisor of advisors) {
      const pointcut = advisor.getPointcut();
      const advice = advisor.getAdvice();
      if (pointcut?.matches?.(method.clazz, method)) {
        interceptors.push(advice);
      }
    }
    return OrderedHelper.sort(interceptors);
  }

  addAdvisor(advisor: PointcutAdvisor) {
    this.advisors.push(advisor);
  }

  intercept(proxy: object, target: object, method: Method, args: object[]) {
    const chain = this.createChain(method);
    return new ReflectiveMethodInvocation(proxy, target, method, args, chain).proceed();
  }
}


function registerHotUpdate(registerAllAdvisorts: CglibAopProxy['registerAllAdvisorts']) {
  hot
    .create(module)
    .clean()
    .allDone(() => {
      // 热更新后这里需要重新注册
      registerAllAdvisorts();
    });
}
