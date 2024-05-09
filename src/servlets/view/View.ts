/**
 * @module View
 * @description 视图组件基类，用于进行内容渲染
 */
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";

export default abstract class View {
  /**
   * 当前视图文件绝对地址
   */
  public url: string

  constructor(url) {
    this.url = url;
  }

  /**
   * 进行视图渲染
   * @param model 当前视图的内容
   * @param request 当前视图
   * @param response 
   */
  abstract render(model, request: HttpServletRequest, response: HttpServletResponse): Promise<void>
}