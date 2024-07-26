/**
 * @module HttpResource
 */

import Resource from './Resource';

export default abstract class HttpResource extends Resource {
  /**
   * 获取自定义的返回头
   */
  abstract getResponseHeaders(): object;
}
