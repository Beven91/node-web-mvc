import { MethodInvocation } from '../invocation/MethodInvocation';
import MethodInterceptor from './MethodInterceptor';

export interface NewableMethodAdviceInterceptor {
  new(handler: Function): AbstractMethodAdviceInterceptor
}

export default abstract class AbstractMethodAdviceInterceptor<T extends Function = Function> extends MethodInterceptor {
  protected handler: T;

  constructor(handler: T) {
    super();
    this.handler = handler;
  }

  abstract invoke(invocation: MethodInvocation): object;
}
