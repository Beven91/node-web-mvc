import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import ModelAndView from "../../models/ModelAndView";
import View from "../../view/View";
import ViewNotFoundError from "../../../errors/ViewNotFoundError";

export default class ModelAndViewMethodReturnValueHandler implements HandlerMethodReturnValueHandler {

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.isParamAssignableOf(ModelAndView);
  }

  async handleReturnValue(mv: ModelAndView, returnType: MethodParameter, servletContext: ServletContext): Promise<void> {
    const { request, response } = servletContext;
    if (response.headersSent) {
      // 如果前置流程已处理了返回
      return;
    }
    // 查找视图
    const view = this.resolveView(mv, servletContext);
    // 渲染视图
    view.render(mv.model, request, response);
  }

  private resolveView(mv: ModelAndView, servletContext: ServletContext): View {
    const { request } = servletContext;
    const viewResolvers = servletContext.configurer.viewResolvers.viewResolvers;
    for (let resolver of viewResolvers) {
      const view = resolver.resolveViewName(mv.view, mv.model, request);
      if (view) {
        return view;
      }
    }
    // 如果没有查到视图，则抛出异常
    throw new ViewNotFoundError(mv.view);
  }
}