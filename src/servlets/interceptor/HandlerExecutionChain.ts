/**
 * @module HandlerExecutionChain  
 * @description 拦截器执行链
 */
import ServletContext from '../http/ServletContext';
import HandlerMethod from '../method/HandlerMethod';
import HandlerInterceptor from './HandlerInterceptor';

export default class HandlerExecutionChain {

  private servletContext: ServletContext

  private handler: any

  /**
   * interceptor中断时的拦截器下标
   */
  private interceptorIndex: number

  /**
   * 构造一个拦截器注册器
   */
  constructor(handler: any, servletContext: ServletContext) {
    this.servletContext = servletContext;
    this.handler = handler;
    this.interceptors = [];
  }

  /**
   * 当前注册所有拦截器实例
   */
  private interceptors: Array<HandlerInterceptor>

  /**
   * 获取当前执行链所有拦截器
   */
  public getInterceptors() {
    return this.interceptors;
  }

  /**
   * 添加拦截器到当前调用链末尾
   * @param interceptor 
   */
  public addInterceptor(...interceptors: Array<HandlerInterceptor>) {
    interceptors.forEach((interceptor) => this.interceptors.push(interceptor))
  }

  /**
   * 添加指定拦截器，到指定下标
   */
  public addInterceptor2(index: number, interceptor: HandlerInterceptor) {
    const allInterceptors = this.interceptors;
    const newInterceptors = [
      ...allInterceptors.slice(0, index),
      interceptor,
      ...allInterceptors.slice(index)
    ]
    this.interceptors.length = 0;
    this.interceptors.push(...newInterceptors);
  }

  /**
   * 获取当前handler
   */
  getHandler(): HandlerMethod {
    return this.handler;
  }

  /**
  * 在处理action前，进行请求预处理，通常可以用于编码、安全控制、权限校验
  * @returns { Promise }
  *   返回值：true表示继续流程（如调用下一个拦截器或处理器）；false表示流程中断（如登录检查失败），不会继续调用其他的拦截器或处理器，此时我们需要通过response来产生响应；
  */
  applyPreHandle(): Promise<boolean> {
    const servletContext = this.servletContext;
    const interceptors = this.interceptors;
    let promise = Promise.resolve(true);
    interceptors.forEach((interceptor, i) => {
      promise = promise.then((result) => {
        // 如果上一个拦截器返回false 则表示中断后续执行，且需要终止整个请求
        if (result === false) {
          return result;
        } else {
          this.interceptorIndex = i;
        }
        const { request, response } = servletContext;
        // 执行拦截器preHandle
        return interceptor.preHandle(request, response, this.handler);
      });
    });
    return promise;
  }

  /**
   * 在处理完action后的拦截函数，可对执行完的接口进行处理
   * @param { any } result 执行action返回的结果
   */
  applyPostHandle(result): Promise<any> {
    const servletContext = this.servletContext;
    const interceptors = this.interceptors;
    let promise: Promise<any> = Promise.resolve();
    // 以倒序的顺序执行拦截器postHandle
    for (let i = interceptors.length - 1; i > -1; i--) {
      const interceptor = interceptors[i];
      promise = promise.then(() => {
        const { request, response } = servletContext;
        return interceptor.postHandle(request, response, this.handler, result);
      });
    }
    return promise.then((r) => (r || result))
  }

  /**
   * 在请求结束后的拦截器 （无论成功还是失败都会执行此拦截函数)
   * （这里可以用于进行资源清理之类的工作）
   * @param { any } ex 如果执行action出现异常时，此参数会有值
   */
  applyAfterCompletion(ex) {
    const servletContext = this.servletContext;
    const interceptors = this.interceptors;
    let promise = Promise.resolve();
    // 以倒序的顺序执行拦截器afterCompletion
    for (let i = this.interceptorIndex; i > -1; i--) {
      const interceptor = interceptors[i];
      promise = promise.then(() => {
        const { request, response } = servletContext;
        return interceptor.afterCompletion(request, response, this.handler, ex)
      });
    }
    return promise;
  }
}