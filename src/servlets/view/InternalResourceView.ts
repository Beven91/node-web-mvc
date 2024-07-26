/**
 * @module RedirectView
 * @description 重定向视图
 */
import View from './View';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';

export default class InternalResourceView extends View {
  async render(model: object, request: HttpServletRequest, response: HttpServletResponse) {
    // 重新执行
    return request.getRequestDispatcher(this.url).forward(request, response);
  }
}
