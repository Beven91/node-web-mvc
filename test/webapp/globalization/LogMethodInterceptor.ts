import {  MethodInterceptor, MethodInvocation } from "../../../src";

export default class LogMethodInterceptor extends MethodInterceptor {

  invoke(invocation: MethodInvocation) {
    const method = invocation.getMethod();
    console.log(`Before Execute ${method.clazz?.name}.${method.handler.name}`,invocation.getArguments());
    const value = invocation.processed();
    console.log(`After Execute ${method.clazz?.name}.${method.handler.name}`, value);
    return value;
  }
}4