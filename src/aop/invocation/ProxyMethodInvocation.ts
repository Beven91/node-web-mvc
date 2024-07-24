import { MethodInvocation } from "./MethodInvocation";

export default interface ProxyMethodInvocation extends MethodInvocation {

  getProxy(): object

  setArguments(...args: any[]): void
}