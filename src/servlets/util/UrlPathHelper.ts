
/**
 * @module UrlPathHelper
 * @description 用于解析请求的路径相关
 */
import HttpServletRequest from "../http/HttpServletRequest";

export default class UrlPathHelper {

  /**
   * 根据request对象获取servlet匹配的路径
   */
  getServletPath(request: HttpServletRequest): string {
    return request.path;
  }
}