import { Invocation } from "./Invocation";
import Method from "../../interface/Method";

export interface MethodInvocation extends Invocation {

  getMethod(): Method

}