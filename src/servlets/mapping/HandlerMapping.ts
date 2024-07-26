/**
 * @module HandlerMapping
 * @description 映射处理器接口类
 */

import HandlerExecutionChain from '../interceptor/HandlerExecutionChain';
import ServletContext from '../http/ServletContext';

export const PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE = 'HandlerMapping.producibleMediaTypes';

export const HANDLE_MAPPING_PATH = '@@HANDLE_MAPPING_PATH@@';

export default interface HandlerMapping {

  /**
   * 根据当前请求上下文对象获取 处理器执行链
   * @param context
   */
  getHandler(context: ServletContext): HandlerExecutionChain

  /**
   * 判断，当前是否使用路径匹配
   */
  usesPathPatterns(): boolean

}
