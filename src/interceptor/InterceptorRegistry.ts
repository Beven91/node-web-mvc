/**
 * @module InterceptorRegistry 
 * @description 拦截器注册表
 */
import HandlerInteceptor from './HandlerInteceptor';
import ServletContext from '../servlets/ServletContext';
import HandlerMethod from './HandlerMethod';

let singleInstance: InterceptorRegistry = null

export default class InterceptorRegistry {

  /**
   * 获取全局实例
   */
  static getInstance(): InterceptorRegistry {
    if (singleInstance) {
      return singleInstance;
    }
    return singleInstance = new InterceptorRegistry();
  }

  /**
  * 构造一个拦截器注册器
  */
  private constructor() {
    this.interceptors = [];
  }

  /**
   * 当前注册所有拦截器实例
   */
  private interceptors: Array<HandlerInteceptor>

  /**
   * 添加一个拦截器
   */
  addInterceptor(interceptor: HandlerInteceptor) {
    this.interceptors.push(interceptor);
  }

  /**
  * 在处理action前，进行请求预处理，通常可以用于编码、安全控制、权限校验
  * @param { ServletContext } servletContext 当前请求上下文
  * @returns { Promise }
  *   返回值：true表示继续流程（如调用下一个拦截器或处理器）；false表示流程中断（如登录检查失败），不会继续调用其他的拦截器或处理器，此时我们需要通过response来产生响应；
  */
  preHandle(servletContext: ServletContext): Promise<boolean> {
    const interceptors = this.interceptors;
    let promise = Promise.resolve(true);
    interceptors.forEach((interceptor, i) => {
      promise = promise.then((result) => {
        // 如果上一个拦截器返回false 则表示中断后续执行，且需要终止整个请求
        if (result === false) {
          return result;
        } else {
          servletContext.interceptorIndex = i;
        }
        const { request, response, handlerMethod } = servletContext;
        // 执行拦截器preHandle
        return interceptor.preHandle(request, response, handlerMethod);
      });
    });
    return promise;
  }

  /**
   * 在处理完action后的拦截函数，可对执行完的接口进行处理
   * @param { ServletContext } servletContext 当前请求上下文
   * @param { any } result 执行action返回的结果
   */
  postHandle(servletContext: ServletContext, result): Promise<any> {
    const interceptors = this.interceptors;
    let promise: Promise<any> = Promise.resolve();
    // 以倒序的顺序执行拦截器postHandle
    for (let i = interceptors.length - 1; i > -1; i--) {
      const interceptor = interceptors[i];
      promise = promise.then(() => {
        const { request, response, handlerMethod } = servletContext;
        return interceptor.postHandle(request, response, handlerMethod, result);
      });
    }
    return promise.then((r) => (r || result))
  }

  /**
   * 在请求结束后的拦截器 （无论成功还是失败都会执行此拦截函数)
   * （这里可以用于进行资源清理之类的工作）
   * @param { ServletContext } servletContext 当前请求上下文
   * @param { any } ex 如果执行action出现异常时，此参数会有值
   */
  afterCompletion(servletContext: ServletContext, ex) {
    const interceptors = this.interceptors;
    let promise = Promise.resolve();
    // 以倒序的顺序执行拦截器afterCompletion
    for (let i = servletContext.interceptorIndex; i > -1; i--) {
      const interceptor = interceptors[i];
      promise = promise.then(() => {
        const { request, response, handlerMethod } = servletContext;
        return interceptor.afterCompletion(request, response, handlerMethod, ex)
      });
    }
    return promise;
  }
}