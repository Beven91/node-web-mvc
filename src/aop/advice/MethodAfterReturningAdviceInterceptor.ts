import JoinPoint from "../invocation/JoinPoint";
import { MethodInvocation } from "../invocation/MethodInvocation";
import AbstractMethodAdviceInterceptor from "./AbstractMethodAdviceInterceptor";

export type MethodReturnHandler = (joinpoint: JoinPoint, result:any) => void

export default class MethodAfterReturningAdviceInterceptor extends AbstractMethodAdviceInterceptor<MethodReturnHandler> {

  invokeAsyncSupport(invocation: MethodInvocation, v: Promise<any>) {
    Promise.resolve(v).then((v) => {
      this.handler(invocation.getJoinPint(), v);
    });
  }

  invoke(invocation: MethodInvocation) {
    const m = invocation.proceed();
    this.invokeAsyncSupport(invocation, m);
    return m;
  }
}