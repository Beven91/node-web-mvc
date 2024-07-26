import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';
import HandlerMethod from '../method/HandlerMethod';
import HandlerInterceptor from './HandlerInterceptor';

export default class MethodInterceptor implements HandlerInterceptor {
  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod): boolean | Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  postHandle(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod): void {
    throw new Error('Method not implemented.');
  }

  afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod, ex: any): void {
    throw new Error('Method not implemented.');
  }
}
