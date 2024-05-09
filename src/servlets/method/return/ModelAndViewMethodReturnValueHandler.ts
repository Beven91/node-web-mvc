import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import ModelAndView from "../../models/ModelAndView";
import ModelAndViewContainer from "../../models/ModelAndViewContainer";

export default class ModelAndViewMethodReturnValueHandler implements HandlerMethodReturnValueHandler {

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.isParamAssignableOf(ModelAndView);
  }

  async handleReturnValue(mv: ModelAndView, returnType: MethodParameter, servletContext: ServletContext, mavContainer: ModelAndViewContainer): Promise<void> {
    const { response } = servletContext;
    if (response.headersSent) {
      // 如果前置流程已处理了返回
      return;
    }
    mavContainer.status = mv.status;
    mavContainer.view = mv.view;
    mavContainer.addAllAttributes(mv.model);
  }
}