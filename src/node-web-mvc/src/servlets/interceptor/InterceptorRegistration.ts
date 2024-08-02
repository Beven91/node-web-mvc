
/**
 * @module InterceptorRegistration
 * @description 拦截器登记信息
 */
import HandlerInterceptor from './HandlerInterceptor';
import MappedInterceptor from './MappedInterceptor';
import PathMatcher from '../util/PathMatcher';

export default class InterceptorRegistration {
  // 登记的拦截器实例
  public readonly interceptor: HandlerInterceptor;

  // 包含项规则列表
  public readonly includePatterns:string[] = [];

  // 排除项规则列表
  public readonly excludePatterns: string[] = [];

  // 路径匹配器。
  private pathMatcher: PathMatcher;

  /**
   * 在注册表中的顺序
   */
  private order = 0;

  /**
   * 构造一个拦截器登记实例
   * @param interceptor 当前登记的拦截器
   */
  constructor(interceptor: HandlerInterceptor) {
    this.interceptor = interceptor;
  }

  /**
   * 设置当前登记信息优先级
   * @param order
   */
  setOrder(order: number) {
    this.order = order;
    return this;
  }

  /**
   * 获取顺序值
   */
  getOrder() {
    return this.order;
  }

  /**
   * 设置当前路径匹配器
   * @param patterns
   */
  setPathMatcher(pathMatcher: PathMatcher) {
    this.pathMatcher = pathMatcher;
  }

  /**
   * 添加拦截器包含规则。
   * 注意：（【包含项规则】 优先级会低于 【排除项规则】）
   * 通过url匹配规则，来设置当前拦截器是否执行。
   */
  addPathPatterns(...patterns: Array<string>) {
    PathMatcher.preBuildPattern(patterns);
    this.includePatterns.push(...patterns);
    return this;
  }

  /**
   * 添加拦截器排除规则。
   * 注意：（【排除项规则】 优先级高于 【包含规则】）
   * 通过url排除规则，来设置当前拦截器，在命中排除规则后，将不会执行。
   * @param patterns
   */
  excludePathPatterns(...patterns: Array<string>) {
    this.excludePatterns.push(...patterns);
    return this;
  }

  /**
   * 获取当前登记的拦截器实例，
   * 会根据配置的信息，来构造对应的实例。
   */
  getInterceptor() {
    if (this.includePatterns.length < 1 && this.excludePathPatterns.length < 1) {
      // 如果没有配置 匹配规则，则直接返回当前拦截器实例
      return this.interceptor;
    }
    // 如果配置了 匹配规则，则构造成一个 MappedInterceptor
    const mappedInterceptor = new MappedInterceptor(this.includePatterns, this.excludePatterns, this.interceptor);
    if (this.pathMatcher) {
      mappedInterceptor.setPathMatcher(this.pathMatcher);
    }
    return mappedInterceptor;
  }
}
