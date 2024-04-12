/**
 * @module ServletContext
 * @description 请求上下文
 */
import { IncomingMessage, ServerResponse } from 'http';
import HttpServletRequest from './HttpServletRequest';
import HttpServletResponse from './HttpServletResponse';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';

type NodeMiddleware = (request: IncomingMessage & { path: string }, response: ServerResponse, next: (error?: any) => any) => any

export interface ServerLaunchOptions {
  handler: NodeMiddleware
  config: WebMvcConfigurationSupport
}

const requestSymbol = Symbol('request');
const responseSymbol = Symbol('response');

export default abstract class ServletContext {

  [requestSymbol]: HttpServletRequest

  [responseSymbol]: HttpServletResponse

  private releaseQueues = new Array<Function>();

  /**
   * forward栈
   */
  public forwardStacks: Array<string>

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
    return this.response.nativeResponse.writableFinished;
  }

  /**
   * 构造一个上下文实例
   * @param request 当前正在处理的请求实例
   * @param response 当前正在处理的请求的返回实例
   * @param next 跳转到下一个请求处理器
   */
  constructor(
    request: HttpServletRequest,
    response: HttpServletResponse
  ) {
    this.forwardStacks = [];
    this[requestSymbol] = request;
    this[responseSymbol] = response;
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
        handler()
        resolve();
      })
    });
    this.releaseQueues.length = 0;
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(options: ServerLaunchOptions): NodeMiddleware {
    const callback = options.handler;
    return (request, response, next) => callback(request, response, next);
  }
}

class S extends ServletContext { }

export type DrivedServletContextClazz = typeof S