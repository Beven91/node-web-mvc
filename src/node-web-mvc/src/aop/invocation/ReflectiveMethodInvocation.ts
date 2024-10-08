import Method from '../../interface/Method';
import Advice from '../advice/Advice';
import MethodInterceptor from '../advice/MethodInterceptor';
import JoinPoint from './JoinPoint';
import MethodInvocationProceedingJoinPoint from './MethodInvocationProceedingJoinPoint';
import ProxyMethodInvocation from './ProxyMethodInvocation';

export default class ReflectiveMethodInvocation implements ProxyMethodInvocation {
  private readonly proxy: object;

  private readonly target: object;

  private readonly method: Method;

  private args: any[];

  private readonly interceptors: Advice[];

  private currentIndex: number;

  private joinPoint: JoinPoint;

  constructor(proxy: object, target: object, method: Method, args: any[], interceptorOradvices: Advice[]) {
    this.proxy = proxy;
    this.target = target;
    this.method = method;
    this.args = args;
    this.currentIndex = -1;
    this.interceptors = interceptorOradvices;
    this.joinPoint = new MethodInvocationProceedingJoinPoint(this, this.proxy);
  }

  getProxy(): object {
    return this.proxy;
  }

  setArguments(...args: any[]): void {
    this.args = args;
  }

  getMethod(): Method {
    return this.method;
  }

  getArguments(): any[] {
    return this.args;
  }

  getJoinPint(): JoinPoint {
    return this.joinPoint;
  }

  proceed() {
    if (this.currentIndex >= (this.interceptors.length - 1)) {
      return this.invokeJoinpoint();
    } else {
      const interceptor = this.interceptors[++this.currentIndex];
      if (interceptor instanceof MethodInterceptor) {
        return interceptor.invoke(this);
      } else {
        if (interceptor) {
          // 其他暂不支持
          console.warn('Unsupported Interceptor:', interceptor);
        }
        return this.proceed();
      }
    }
  }

  private invokeJoinpoint() {
    return this.getMethod().handler.apply(this.target, this.args);
  }

  getThis() {
    return this.target;
  }
}
