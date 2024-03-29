/**
 * @module ServletContext
 * @description 请求上下文
 */
import { IncomingMessage, ServerResponse } from 'http';
import HttpServletRequest from './HttpServletRequest';
import HttpServletResponse from './HttpServletResponse';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HandlerExecutionChain from '../interceptor/HandlerExecutionChain';
import type InternalErrorHandler from './error/InternalErrorHandler';
import { IDispatcher } from './IDispatcher';

type NodeMiddleware = (request: IncomingMessage & { path: string }, response: ServerResponse, next: (error?: any) => any) => any

export interface ServerLaunchOptions {
  handler: NodeMiddleware
  config: WebMvcConfigurationSupport
}

export default abstract class ServletContext {

  private releaseQueues = new Array<Function>();

  public readonly dispatcher: IDispatcher

  /**
   * 是否next函数被调用
   */
  public isNextInvoked: boolean

  /**
   * forward栈
   */
  public forwardStacks: Array<string>

  /**
   * 当前网站的全局配置
   */
  public readonly configurer: WebMvcConfigurationSupport;

  /**
   * 当前正在处理的请求实例
   */
  public request: HttpServletRequest;

  /**
   * 当前正在处理的请求的返回实例
   */
  public response: HttpServletResponse;

  /**
   * 当前匹配的处理器执行链
   */
  public chain: HandlerExecutionChain

  private params: Map<any, any>

  /**
   * 跳转到下一个请求处理器
   */
  public readonly next: (error?) => void;

  public requestDefinitionInstances;

  /**
   * 设置属性值
   * @param name 属性名
   * @param value 属性值
   */
  public setAttribute(name: any, value: any) {
    this.params.set(name, value);
  }

  /**
   * 获取属性值
   * @param name 属性名称 
   */
  public getAttrigute(name) {
    return this.params.get(name);
  }

  public isRequestHandled() {
    return this.response.nativeResponse.writableFinished;
  }

  /**
   * 构造一个上下文实例
   * @param request 当前正在处理的请求实例
   * @param response 当前正在处理的请求的返回实例
   * @param next 跳转到下一个请求处理器
   */
  constructor(
    configurer: WebMvcConfigurationSupport,
    request: IncomingMessage,
    response,
    next,
    errorHandler: InternalErrorHandler,
    dispatcher: IDispatcher
  ) {
    this.dispatcher = dispatcher;
    this.configurer = configurer;
    this.request = new HttpServletRequest(request, this);
    this.response = new HttpServletResponse(response, this, errorHandler);
    this.params = new Map<any, any>();
    this.next = (...params) => {
      // 如果已经返回了内容，则不进行next处理
      if (this.response.headersSent) return;
      if (!this.response.nativeResponse.writableFinished) {
        next(...params);
      }
      this.isNextInvoked = true;
    };
    this.forwardStacks = [];
    this.requestDefinitionInstances = {};
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