/**
 * @module ServletContext
 * @description 请求上下文
 */
import { IncomingMessage } from 'http';
import ServletModel from '../models/ServletModel';
import HttpServletRequest from './HttpServletRequest';
import HttpServletResponse from './HttpServletResponse';
import WebAppConfigurer from '../WebAppConfigurer';
import RequestBeanProvider from '../../ioc/provider/RequestBeanProvider';

export default abstract class ServletContext {

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
  public readonly configurer: WebAppConfigurer;

  /**
   * 当前正在处理的请求实例
   */
  public request: HttpServletRequest;

  /**
   * 当前正在处理的请求的返回实例
   */
  public response: HttpServletResponse;

  /**
   * 跳转到下一个请求处理器
   */
  public readonly next: (error?) => void;

  /**
   * 当前正在处理的请求匹配到的控制器类
   */
  public Controller;

  /**
   * 当前正在处理的请求从路由中匹配到的参数信息
   */
  public params: Map<string, any>;

  /**
   * 当前路由匹配的控制器域名称
   */
  public areaName: string;

  /**
   * 当前正在处理的请求根据路由匹配到的执行函数
   */
  public action: (request, response, next) => Promise<ServletModel>;

  /**
   * 当前正在处理的请求根据路由匹配到的执行函数名称
   */
  public actionName: string

  /**
   * 当前正在处理的控制器实例
   */
  public controller

  /**
   * 当前正在处理的请求根据路由匹配到的控制器名称
   */
  public controllerName: string

  public requestDefinitionInstances;

  /**
   * 构造一个上下文实例
   * @param request 当前正在处理的请求实例
   * @param response 当前正在处理的请求的返回实例
   * @param next 跳转到下一个请求处理器
   */
  constructor(configurer: WebAppConfigurer, request: IncomingMessage, response, next) {
    this.request = new HttpServletRequest(request, this);
    this.response = new HttpServletResponse(response, this);
    this.configurer = configurer;
    this.next = (...params) => {
      next(...params);
      this.isNextInvoked = true;
    };
    this.forwardStacks = [];
    // 当前匹配到的控制器类
    this.Controller = null;
    // 当前请求提取出来的参数
    this.params = ({}) as Map<string, any>;
    this.requestDefinitionInstances = {};
    RequestBeanProvider.servletContext = this;
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback: Function): (request, response, next) => any {
    return (request, response, next) => callback(request, response, next);
  }
}