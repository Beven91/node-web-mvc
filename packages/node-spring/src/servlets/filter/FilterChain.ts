import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';
export default interface FilterChain {

  doFilter(request: HttpServletRequest, response: HttpServletResponse): Promise<void>
}
