/**
 * @module HandlerAdapter 
 * @description action操作适配器接口
 */
import ServletModel from '../models/ServletModel';
import ServletContext from '../http/ServletContext';
import { HttpServletRequest } from '../..';

export default interface HandlerAdapter {
  /**
    * 用于判断当前适配器是否能处理对应的action操作
    */
  supports(handler): boolean;

  /**
   * 当supports返回true 时，用于执行当前action的函数
   */
  handle(servletContext: ServletContext, handler): Promise<ServletModel>;

  /**
   * 返回上次修改时间，可以返回-1表示不支持
   */
  getLastModified(request: HttpServletRequest, handler);
}