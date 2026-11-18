import { MethodInvocation } from '../invocation/MethodInvocation';
import MethodInterceptor from './MethodInterceptor';

export type AdviceBaseHandler = (...args: any) => any;
export interface NewableMethodAdviceInterceptor {
  // eslint-disable-next-line
  new(handler: AdviceBaseHandler): AbstractMethodAdviceInterceptor
}

export default abstract class AbstractMethodAdviceInterceptor<T extends Function = Function> extends MethodInterceptor {
  protected handler: T;

  constructor(handler: T) {
    super();
    this.handler = handler;
  }

  abstract invoke(invocation: MethodInvocation): object;
}
