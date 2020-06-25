/**
 * @module View
 * @description 视图组件基类，用于进行内容渲染
 */
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";

export default interface View {

  /**
   * 进行视图渲染
   * @param model 当前视图的内容
   * @param request 当前视图
   * @param response 
   */
  render(model, request: HttpServletRequest, response: HttpServletResponse): Promise<any> 
}