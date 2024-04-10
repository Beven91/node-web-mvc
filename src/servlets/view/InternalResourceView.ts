/**
 * @module RedirectView
 * @description 重定向视图
 */
import querystring from 'querystring';
import View from './View';
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import ForwardEndlessLoopError from '../../errors/ForwardEndlessLoopError';

export default class InternalResourceView extends View {

  render(model, request: HttpServletRequest, response: HttpServletResponse) {
    // 重新执行
    return request.getRequestDispatcher(this.url).forward(request, response);
  }
}