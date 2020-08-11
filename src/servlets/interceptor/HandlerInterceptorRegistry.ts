/**
 * @module HandlerInteceptorRegistry
 * @description 拦截器注册表
 */
import HandlerInterceptor from './HandlerInterceptor';

const interceptors = [];

export default class HandlerInteceptorRegistry {

  static getInterceptors(): Array<HandlerInterceptor> {
    return interceptors;
  }

  /**
    * 添加一个拦截器
    */
  static addInterceptor(interceptor: HandlerInterceptor) {
    interceptors.push(interceptor);
  }
}