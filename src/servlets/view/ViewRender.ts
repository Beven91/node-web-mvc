import ViewNotFoundError from "../../errors/ViewNotFoundError";
import ServletContext from "../http/ServletContext";
import ModelAndView from "../models/ModelAndView";
import View from "./View";
import ViewResolverRegistry from "./ViewResolverRegistry";

export default class ViewRender {

  viewResolverRegistry: ViewResolverRegistry

  constructor(viewResolverRegistry: ViewResolverRegistry) {
    this.viewResolverRegistry = viewResolverRegistry;
  }

  async render(mv: ModelAndView, servletContext: ServletContext): Promise<void> {
    const { request, response } = servletContext;
    if (response.headersSent) {
      // 如果前置流程已处理了返回
      return;
    }
    // 查找视图
    const view = this.resolveView(mv, servletContext);
    if (mv.status) {
      servletContext.response.setStatus(mv.status);
    }
    // 渲染视图
    return view.render(mv.model, request, response);
  }

  private resolveView(mv: ModelAndView, servletContext: ServletContext): View {
    const { request } = servletContext;
    const viewResolvers = this.viewResolverRegistry.viewResolvers;
    if (mv.view instanceof View) {
      return mv.view;
    }
    for (let resolver of viewResolvers) {
      const view = resolver.resolveViewName(mv.view, mv.model, request);
      if (view) {
        return view;
      }
    }
    // 如果没有查到视图，则抛出异常
    throw new ViewNotFoundError(mv.view || "''");
  }
}