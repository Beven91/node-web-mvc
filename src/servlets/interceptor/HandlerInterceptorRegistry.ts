/**
 * @module HandlerInteceptorRegistry
 * @description 拦截器注册表
 */
import HandlerInterceptor from './HandlerInterceptor';
import ListReplacement from '../../hot/ListReplacement';
import hot from '../../hot';

const interceptors: Array<HandlerInterceptor> = [];

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

/**
 * 内部热更新 
 */
hot.create(module)
  .postend((now, old) => {
    new ListReplacement(interceptors, now, old);
  });