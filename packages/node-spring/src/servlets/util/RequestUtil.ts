/**
 * @module RequestUtil
 * @description 请求工具
 */

import HttpServletRequest from '../http/HttpServletRequest';

export default class RequestUtil {
  static getHeader(request: HttpServletRequest, name: string) {
    const v = request.getHeader(name);
    if (v instanceof Array) {
      return v.join(';');
    }
    return v || '';
  }

  static parseDataHeader(request: HttpServletRequest, name: string) {
    let v = request.getDateHeader(name);
    if (!v) {
      const h = this.getHeader(request, name).split(';');
      v = Date.parse(h[0]);
    }
    return isNaN(v) ? -1 : v;
  }

  static padEtagIfNecessary(etag: string) {
    if (!etag) {
      return etag;
    }
    if ((etag.startsWith('"') || etag.startsWith('W/"')) && etag.endsWith('"')) {
      return etag;
    }
    return '"' + etag + '"';
  }
}
