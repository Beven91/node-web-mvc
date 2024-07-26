import JoinPoint from './Joinpoint';
import { AopJoinpoint } from './AopJoinpoint';

export interface Invocation extends AopJoinpoint {
  getArguments(): any[]

  getJoinPint(): JoinPoint
}
