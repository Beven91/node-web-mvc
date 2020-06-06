/**
 * @module HandlerInterceptor
 * 拦截器接口定义
 */

export default interface HandlerInterceptor {
  /**
   * 在处理action前，进行请求预处理，通常可以用于编码、安全控制、权限校验
   * @param { HttpRequest } request 当前请求对象
   * @param { HttpResponse } response 当前响应对象
   * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
   * @returns { boolean }
   *   返回值：true表示继续流程（如调用下一个拦截器或处理器）；false表示流程中断（如登录检查失败），不会继续调用其他的拦截器或处理器，此时我们需要通过response来产生响应；
   */
  preHandle(request, response, handler) : boolean;

  /**
   * 在处理完action后的拦截函数，可对执行完的接口进行处理
   * @param { HttpRequest } request 当前请求对象
   * @param { HttpResponse } response 当前响应对象
   * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
   * @param { any } result 执行action返回的结果
   */
  postHandle(request, response, handler, result) : void;

  /**
   * 在请求结束后的拦截器 （无论成功还是失败都会执行此拦截函数)
   * （这里可以用于进行资源清理之类的工作）
   * @param { HttpRequest } request 当前请求对象
   * @param { HttpResponse } response 当前响应对象
   * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
   * @param { any } ex 如果执行action出现异常时，此参数会有值
   */
  afterCompletion(request, response, handler, ex) : void;
}