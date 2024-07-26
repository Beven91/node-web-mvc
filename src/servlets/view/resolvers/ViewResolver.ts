/**
 * @module ViewResolver
 * @description 视图解析基类
 */

import View from '../View';
import HttpServletRequest from '../../http/HttpServletRequest';

export default interface ViewResolver {

  /**
   * 根据传入的视图与数据来获取对应的视图
   * @param {String} viewName 视图名称
   * @param {Object} model 视图数据
   * @param {HttpServletRequest} request 当前http请求实例
   */
  resolveViewName(viewName: string, model: any, request: HttpServletRequest): View
}
