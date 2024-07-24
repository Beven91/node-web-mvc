import { MethodInterceptor, MethodInvocation } from "../../../src";

export default class LogMethodInterceptor extends MethodInterceptor {

  invoke(invocation: MethodInvocation) {
    const method = invocation.getMethod();
    console.log(`===> AOP Interceptor: Before Execute ${method.clazz?.name}.${method.handler.name}`, invocation.getArguments());
    const value = invocation.proceed();
    console.log(`===> AOP Interceptor: After Execute ${method.clazz?.name}.${method.handler.name}`, value);
    return value;
  }
}