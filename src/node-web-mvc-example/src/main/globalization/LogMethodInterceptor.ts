import { MethodInterceptor, MethodInvocation } from 'node-web-mvc';

export default class LogMethodInterceptor extends MethodInterceptor {
  invoke(invocation: MethodInvocation) {
    const method = invocation.getMethod();
    console.log(`===> a. AOP Interceptor: Before Execute ${method.clazz?.name}.${method.handler.name}`, '<<Arguments>>===>', invocation.getArguments());
    const value = invocation.proceed();
    console.log(`===> b. AOP Interceptor: After Execute ${method.clazz?.name}.${method.handler.name}, <<Return Value>>===>`, value);
    return value;
  }
}
