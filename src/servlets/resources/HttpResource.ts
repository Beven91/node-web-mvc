/**
 * @module HttpResource
 */

import Resource from "./Resource";

export default class HttpResource extends Resource {

  /**
   * 获取自定义的返回头
   */
  getResponseHeaders() {
    return {};
  }

}