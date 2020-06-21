/**
 * @module AbstractHandlerMethodAdapter
 * @description action方法处理适配器抽象基类
 */
import HandlerMethod from './HandlerMethod';
import HandlerAdapter from './HandlerAdapter';
import ServletContext from '../http/ServletContext';

export default abstract class AbstractHandlerMethodAdapter implements HandlerAdapter {

  /**
   * 用于判断当前适配器是否能处理对应的action操作
   * @param handler 当前处理的handler
   */
  public supports(handler): boolean {
    return (handler instanceof HandlerMethod && this.supportsInternal(handler));
  }

  /**
   *  用于判断当前适配器是否能处理对应的HandlerMethod类型操作
   * @param handlerMethod 当前处理的方法
   */
  protected abstract supportsInternal(handlerMethod: HandlerMethod): boolean;

  /**
   * 用于处理当前handler
   * @param servletContext  当前请求对象上下文实例
   * @param handler 当前handler
   */
  public handle(servletContext: ServletContext, handler) {
    return this.handleInternal(servletContext, handler as HandlerMethod);
  }

  /**
   * 用于处理当前HandlerMethod
   * @param request 当前请求对象实例
   * @param response 当前返回对象实例
   * @param handlerMethod 当前 HandlerMethod实例
   */
  protected abstract handleInternal(servletContext: ServletContext, handlerMethod: HandlerMethod);

  /**
   * 返回上次修改时间，可以返回-1表示不支持
   * @param request 当前请求信息
   * @param handler 当前HandlerMethod
   */
  public getLastModified(request, handler) { }
}  