import { MethodInvocation } from '../invocation/MethodInvocation';
import Advice from './Advice';

export default abstract class MethodInterceptor extends Advice {
  abstract invoke(invocation: MethodInvocation): any;
}
