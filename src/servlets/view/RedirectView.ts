/**
 * @module RedirectView
 * @description 重定向视图
 */

import View from './View';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';

export default class RedirectView extends View {
  render(model, request: HttpServletRequest, response: HttpServletResponse) {
    const url = this.url;
    const isAbs = /^(http|https):/.test(url);
    const isRoot = /^\//.test(url);
    const redirectUrl = isAbs ? url : isRoot ? request.fdomain + '/' + url : request.baseUrl + url;
    // 执行重定向
    response.sendRedirect(redirectUrl, 302);
    return null;
  }
}
