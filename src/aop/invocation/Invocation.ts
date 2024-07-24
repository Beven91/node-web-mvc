import JoinPoint from "./JoinPoint";
import { AopJoinpoint } from "./AopJoinpoint";

export interface Invocation extends AopJoinpoint {
  getArguments(): any[]

  getJoinPint(): JoinPoint
}