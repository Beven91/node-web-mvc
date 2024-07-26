/**
 * @module HandlerInteceptorRegistry
 * @description 拦截器注册表
 */
import HandlerInterceptor from './HandlerInterceptor';
import InterceptorRegistration from './InterceptorRegistration';

export default class HandlerInteceptorRegistry {
  private readonly registrations: Array<InterceptorRegistration>;

  constructor() {
    this.registrations = [];
  }

  /**
   * 获取当前注册的所有拦截器
   */
  getInterceptors(): Array<HandlerInterceptor> {
    return this.registrations
      .sort((o1, o2) => o1.getOrder() - o2.getOrder())
      .map((registration) => registration.getInterceptor());
  }

  /**
   * 添加一个拦截器
   */
  addInterceptor(interceptor: HandlerInterceptor) {
    const registration = new InterceptorRegistration(interceptor);
    this.registrations.push(registration);
    return registration;
  }
}
