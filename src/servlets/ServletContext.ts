/**
 * @module ServletContext
 * @description 请求上下文
 */
import HandlerMethod from '../interceptor/HandlerMethod';
import ServletModel from '../models/ServletModel';

export default abstract class ServletContext {

  /**
   * 当前正在处理的请求实例
   */
  public request;

  /**
   * 当前正在处理的请求的返回实例
   */
  public response;

  /**
   * 跳转到下一个请求处理器
   */
  public next: (error?) => void;

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

  /**
   * 当前匹配的action的执行器
   */
  public handlerMethod: HandlerMethod;

  /**
   * interceptor终端时的拦截器下标
   */
  public interceptorIndex: number

  /**
   * 当前请求的path 例如: order/list
   */
  abstract get path(): string;

  /**
   * 当前请求的谓词，例如: GET POST PUT DELETE等
   */
  abstract get method(): string;

  /**
   * 返回内容到客户端
   * @param {any} data 要返回的数据
   * @param {number} status 当前设置的返回状态码
   * @param {String} procudes 当前返回的内容类型
   */
  abstract end(data: any, status: number, procudes: string, );

  /**
   * 构造一个上下文实例
   * @param request 当前正在处理的请求实例
   * @param response 当前正在处理的请求的返回实例
   * @param next 跳转到下一个请求处理器
   */
  constructor(request, response, next) {
    this.request = request;
    this.response = response;
    this.next = next;
    // 当前匹配到的控制器类
    this.Controller = null;
    // 当前请求提取出来的参数
    this.params = ({}) as Map<string, any>;
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback): (request, response, next) => any {
    return (request, response, next) => callback(request, response, next);
  }
}