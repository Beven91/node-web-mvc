import { Joinpoint } from "./Joinpoint";

export interface Invocation extends Joinpoint {
  getArguments(): any[]
}