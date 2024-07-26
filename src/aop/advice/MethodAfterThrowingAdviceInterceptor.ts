import JoinPoint from '../invocation/JoinPoint';
import { MethodInvocation } from '../invocation/MethodInvocation';
import AbstractMethodAdviceInterceptor from './AbstractMethodAdviceInterceptor';

export type MethodErrorHandler = (joinpoint: JoinPoint, ex: any) => void;

export default class MethodAfterThrowingAdviceInterceptor extends AbstractMethodAdviceInterceptor<MethodErrorHandler> {
  private invokeAsyncSupport(invocation: MethodInvocation, v: Promise<any>) {
    Promise.resolve(v).catch((ex) => {
      this.handler(invocation.getJoinPint(), ex);
    });
  }

  invoke(invocation: MethodInvocation) {
    try {
      const v = invocation.proceed();
      // 支持异步函数
      this.invokeAsyncSupport(invocation, v);
      return v;
    } catch (ex) {
      // 如果非异步异常
      this.handler(invocation.getJoinPint(), ex);
      throw ex;
    }
  }
}
