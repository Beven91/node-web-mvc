/**
 * @module MappedInterceptor
 * @description 一个带路径匹配模式的拦截器.
 */
import HandlerInterceptor from './HandlerInterceptor';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';
import PathMatcher from '../util/PathMatcher';
import AbstractHandlerMapping from '../mapping/AbstractHandlerMapping';

export default class MappedInterceptor implements HandlerInterceptor {

  // 包含项规则列表
  private includePatterns: Array<string>

  // 排除项规则列表
  private excludePatterns: Array<string>

  // 当前实际承载的拦截器
  private interceptor: HandlerInterceptor

  // 路径匹配器
  private pathMatcher = new PathMatcher()

  /**
   * 构造一个路径匹配型拦截器
   * @param includePatterns 包含项规则列表
   * @param excludePatterns 排除项规则列表
   * @param interceptor 当前实际承载的拦截器
   */
  constructor(includePatterns: Array<string>, excludePatterns: Array<string>, interceptor: HandlerInterceptor) {
    this.includePatterns = includePatterns || [];
    this.excludePatterns = excludePatterns || [];
    this.interceptor = interceptor;
  }

  /**
   * 根据传入的请求对象进行路径匹配，用以判定是否可以使用当前拦截器。
   */
  matches(request: HttpServletRequest): boolean {
    // 这里仅做根据请求路径进行匹配，暂不支持高级路径匹配
    const path = request.servletContext.getAttrigute(AbstractHandlerMapping.HANDLE_MAPPING_PATH);
    // 1.优先执行排除项
    for (let pattern of this.excludePatterns) {
      if (this.matchPattern(pattern, path)) {
        // 如果匹配为排除项，则返回false
        return false;
      }
    }
    if (this.includePatterns.length < 1) {
      // 2. 如果没有配置包含项规则，则直接返回true
      return true;
    }
    // 3. 匹配包含项
    for (let pattern of this.includePatterns) {
      if (this.matchPattern(pattern, path)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 执行路径规则匹配
   * @param pattern 规则 
   * @param path 路径
   */
  private matchPattern(pattern: string, path: string) {
    return this.pathMatcher.match(pattern, path);
  }

  /**
   * 设置当前路径匹配器
   */
  setPathMatcher(pathMatcher: PathMatcher) {
    this.pathMatcher = pathMatcher;
  }

  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler): Promise<boolean> | boolean {
    return this.interceptor.preHandle(request, response, handler);
  }

  postHandle(request: HttpServletRequest, response: HttpServletResponse, handler, modelAndView): void {
    return this.interceptor.postHandle(request, response, handler, modelAndView);
  }

  afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler, ex): void {
    return this.interceptor.afterCompletion(request, response, handler, ex);
  }
}