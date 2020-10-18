import HttpServletRequest from '../http/HttpServletRequest';
import HttpMethod from '../http/HttpMethod';

/**
 * @module CorsUtil
 * @description 请求跨域相关辅助工具
 */

export default class CorsUtil {

  /**
   * 判断是否为预检模式
   */
  static isPreFlightRequest(request: HttpServletRequest) {
    return request.method === HttpMethod.OPTIONS && request.headers['origin'] && request.headers['access-control-request-method'];
  }

}