/**
 * @module InterceptorRegistry 
 * @description 拦截器注册表
 */
import HandlerInteceptor from './HandlerInteceptor';

class InterceptorRegistry {
  /**
  * 构造一个拦截器注册器
  */
  constructor() {
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
}

export default new InterceptorRegistry();