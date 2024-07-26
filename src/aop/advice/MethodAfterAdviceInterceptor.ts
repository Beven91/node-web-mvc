import JoinPoint from '../invocation/JoinPoint';
import { MethodInvocation } from '../invocation/MethodInvocation';
import AbstractMethodAdviceInterceptor from './AbstractMethodAdviceInterceptor';

export type MethodAfterHandler = (joinpoint: JoinPoint, value: object, ex: object) => void

export default class MethodAfterAdviceInterceptor extends AbstractMethodAdviceInterceptor<MethodAfterHandler> {
  invokeAsyncSupport(invocation: MethodInvocation, v: Promise<object>) {
    Promise
      .resolve(v)
      .then(
        (value) => {
          this.handler(invocation.getJoinPint(), value, null);
        },
        (error) => {
          this.handler(invocation.getJoinPint(), null, error);
        }
      );
  }

  invoke(invocation: MethodInvocation) {
    const v = invocation.proceed();
    this.invokeAsyncSupport(invocation, v);
    return v;
  }
}
