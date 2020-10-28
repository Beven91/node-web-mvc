/**
 * @module HandlerInteceptorRegistry
 * @description 拦截器注册表
 */
import HandlerInterceptor from './HandlerInterceptor';
import InterceptorRegistration from './InterceptorRegistration';
import hot from 'nodejs-hmr';

export default class HandlerInteceptorRegistry {

  private readonly registrations: Array<InterceptorRegistration>

  constructor() {
    this.registrations = new Array<InterceptorRegistration>();
    hotAccepted(this.registrations);
  }

  /**
   * 获取当前注册的所有拦截器
   */
  getInterceptors(): Array<HandlerInterceptor> {
    return this.registrations
      .sort((o1, o2) => o1.getOrder() - o2.getOrder())
      .map((registration) => registration.getInterceptor())
  }

  /**
   * 添加一个拦截器
   */
  addInterceptor(interceptor: HandlerInterceptor) {
    const registration = new InterceptorRegistration(interceptor);
    this.registrations.push(registration)
    return registration;
  }
}

/**
 * 内部热更新 
 */
function hotAccepted(registrations) {
  hot.create(module)
    .clean()
    .postend((now, old) => {
      hot
        .createHotUpdater<InterceptorRegistration>(registrations, now, old)
        .needHot((a, ctor) => a.interceptor instanceof ctor)
        .creator((ctor, oldInterceptor) => {
          const registration = new InterceptorRegistration(new ctor());
          if (oldInterceptor.includePatterns.length > 0) {
            registration.addPathPatterns(...oldInterceptor.includePatterns);
          }
          if (oldInterceptor.excludePatterns.length > 0) {
            registration.excludePathPatterns(...oldInterceptor.excludePatterns);
          }
          return registration;
        })
        .update()
    });
}
