/**
 * @module RedirectView
 * @description 重定向视图
 */

import { View } from "../../..";
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";

export default class RedirectView implements View {

  /**
   * 重定向的目标url
   */
  private url: string

  constructor(url) {
    this.url = url;
  }

  render(model, request: HttpServletRequest, response: HttpServletResponse) {
    // 执行重定向
    response.sendRedirect(this.url, 302);
    return null;
  }
}