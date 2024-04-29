/**
 * @module HandlerAdapter 
 * @description action操作适配器接口
 */
import HttpServletRequest from '../http/HttpServletRequest';
import ServletContext from '../http/ServletContext';

export default abstract class HandlerAdapter {
  /**
    * 用于判断当前适配器是否能处理对应的action操作
    */
  abstract supports(handler): boolean;

  /**
   * 当supports返回true 时，用于执行当前action的函数
   */
  abstract handle(servletContext: ServletContext, handler): Promise<any>;

  /**
   * 返回上次修改时间，可以返回-1表示不支持
   */
  abstract getLastModified(request: HttpServletRequest, handler);
}