import Javascript from "../../interface/Javascript";
import Tracer from "../../servlets/annotations/annotation/Tracer";
import JoinPoint from "./JoinPoint";
import type { MethodInvocation } from "./MethodInvocation";

export default class MethodInvocationProceedingJoinPoint implements JoinPoint {

  private readonly methodInvocation: MethodInvocation

  private readonly proxy: object

  constructor(invocation: MethodInvocation, proxy: object) {
    this.methodInvocation = invocation;
    this.proxy = proxy;
  }

  getArgs(): object[] {
    return this.methodInvocation.getArguments();
  }

  getThis(): object {
    return this.proxy;
  }

  getTarget(): object {
    return this.methodInvocation.getThis();
  }

  getSignature(): string {
    const id = Tracer.getFullName(this.getTarget().constructor);
    const handler = this.methodInvocation.getMethod().handler;
    const parameters = Javascript.resolveParameters(handler);
    return `any ${id}.${handler.name}(${parameters.join(', ')})`
  }
}