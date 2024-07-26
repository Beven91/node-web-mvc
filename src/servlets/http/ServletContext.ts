/**
 * @module ServletContext
 * @description 请求上下文
 */
import type HttpServletRequest from './HttpServletRequest';
import type HttpServletResponse from './HttpServletResponse';

const requestSymbol = Symbol('request');
const responseSymbol = Symbol('response');

export default class ServletContext {
  [requestSymbol]: HttpServletRequest;

  [responseSymbol]: HttpServletResponse;

  private releaseQueues: Function[] = [];

  /**
   * forward栈
   */
  public forwardStacks: Array<string>;

  /**
   * 当前正在处理的请求实例
   */
  public get request() {
    return this[requestSymbol] as HttpServletRequest;
  }

  /**
   * 当前正在处理的请求的返回实例
   */
  public get response() {
    return this[responseSymbol] as HttpServletResponse;
  }

  public get isRequestHandled() {
    return this.response.headersSent;
  }

  /**
   * 构造一个上下文实例
   * @param request 当前正在处理的请求实例
   * @param response 当前正在处理的请求的返回实例
   * @param next 跳转到下一个请求处理器
   */
  constructor(
    request: HttpServletRequest,
    response: HttpServletResponse,
  ) {
    this.forwardStacks = [];
    Object.defineProperty(this, requestSymbol, { value: request, enumerable: false });
    Object.defineProperty(this, responseSymbol, { value: response, enumerable: false });
    request.setServletContext(this);
  }

  /**
   * 添加一个资源销毁操作
   * @param handler 当前销毁函数会在请求结束后执行（无论请求执行成功还是失败)
   */
  addReleaseQueue(handler) {
    this.releaseQueues.push(handler);
  }

  /**
   * 执行资源释放队列
   */
  doReleaseQueues() {
    this.releaseQueues.forEach((handler) => {
      new Promise((resolve: any) => {
        handler();
        resolve();
      });
    });
    this.releaseQueues.length = 0;
  }
}
