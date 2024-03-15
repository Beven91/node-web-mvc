import Component from "../../../ioc/annotations/Component";
import HttpServletRequest from "../../http/HttpServletRequest";
import HttpServletResponse from "../../http/HttpServletResponse";
import View from "../../view/View";


@Component("error")
export default class DefaultErrorView extends View {
  render(model: any, request: HttpServletRequest, response: HttpServletResponse) {
    
  }
}