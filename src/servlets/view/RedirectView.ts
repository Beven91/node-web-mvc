/**
 * @module RedirectView
 * @description 重定向视图
 */

import View from './View'
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";

export default class RedirectView extends View {

  render(model, request: HttpServletRequest, response: HttpServletResponse) {
    // 执行重定向
    response.sendRedirect(this.url, 302);
    return null;
  }
}