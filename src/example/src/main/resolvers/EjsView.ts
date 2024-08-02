/**
 * @module EjsView
 * @description Razor视图
 */
import ejs from 'ejs';
import { View,HttpServletRequest,HttpServletResponse, MediaType  } from 'node-web-mvc';

export default class EjsView extends View {
  /**
   * 进行视图渲染
   * @param model 当前视图的内容
   * @param request 当前视图
   * @param response
   */
  render(model, request: HttpServletRequest, response: HttpServletResponse) {
    return ejs.renderFile(this.url, model).then((html) => {
      response.setStatus(200).fullResponse(html, MediaType.TEXT_HTML);
    });
  }
}
