/**
 * @module HandlerInteceptorRegistry
 * @description 拦截器注册表
 */
import HandlerInterceptor from './HandlerInterceptor';
import hot from 'nodejs-hmr';

const interceptors: Array<HandlerInterceptor> = [];

export default class HanListReplacementdlerInteceptorRegistry {

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
    new hot.ListReplacement(interceptors, now, old);
  });