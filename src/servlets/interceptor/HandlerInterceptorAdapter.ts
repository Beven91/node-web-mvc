
/**
 * @module HandlerInterceptorAdapter
 * 拦截器适配器抽象类
 */
import HandlerInterceptor from './HandlerInterceptor';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';

export default abstract class HandlerInterceptorAdapter implements HandlerInterceptor {
  /**
   * 在处理action前，进行请求预处理，通常可以用于编码、安全控制、权限校验
   * @param { HttpServletRequest } request 当前请求对象
   * @param { HttpServletResponse } response 当前响应对象
   * @param { object } handler  当前请求处理器
   * @returns { boolean }
   *   返回值：true表示继续流程（如调用下一个拦截器或处理器）；false表示流程中断（如登录检查失败），不会继续调用其他的拦截器或处理器，此时我们需要通过response来产生响应；
   */
  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: object): Promise<boolean> | boolean {
    return true;
  }

  /**
   * 在处理完action后的拦截函数，可对执行完的接口进行处理
   * @param { HttpServletRequest } request 当前请求对象
   * @param { HttpServletResponse } response 当前响应对象
   * @param { object } handler  当前请求处理器
   * @param { any } result 执行action返回的结果
   */
  postHandle(request: HttpServletRequest, response: HttpServletResponse, handler: object, result): void {
  }

  /**
   * 在请求结束后的拦截器 （无论成功还是失败都会执行此拦截函数)
   * （这里可以用于进行资源清理之类的工作）
   * @param { HttpServletRequest } request 当前请求对象
   * @param { HttpServletResponse } response 当前响应对象
   * @param { object } handler  当前请求处理器
   * @param { any } ex 如果执行action出现异常时，此参数会有值
   */
  afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: object, ex): void {
  }
}