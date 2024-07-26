import JoinPoint from '../invocation/JoinPoint';
import { MethodInvocation } from '../invocation/MethodInvocation';
import AbstractMethodAdviceInterceptor from './AbstractMethodAdviceInterceptor';

export type MethodBeforeHandler = (joinPoint: JoinPoint)=> void

export default class MethodBeforeAdviceInterceptor extends AbstractMethodAdviceInterceptor<MethodBeforeHandler> {
  invoke(invocation: MethodInvocation) {
    this.handler(invocation.getJoinPint());
    return invocation.proceed();
  }
}
