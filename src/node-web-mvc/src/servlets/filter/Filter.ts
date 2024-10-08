import type HttpServletRequest from '../http/HttpServletRequest';
import type HttpServletResponse from '../http/HttpServletResponse';
import type FilterChain from './FilterChain';

export default abstract class Filter {
  /**
   * 执行过滤器
   * @param request http请求对象
   * @param response http返回对象
   */
  abstract doFilter(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain): Promise<void>;
}
