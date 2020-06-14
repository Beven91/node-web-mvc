/**
 * @module HandlerInteceptorRegistry
 * @description 拦截器注册表
 */
import HandlerInteceptor from './HandlerInteceptor';

const interceptors = [];

export default class HandlerInteceptorRegistry {

  static getInterceptors(): Array<HandlerInteceptor> {
    return interceptors;
  }

  /**
    * 添加一个拦截器
    */
  static addInterceptor(interceptor: HandlerInteceptor) {
    interceptors.push(interceptor);
  }
}