import HttpServletRequest from "./HttpServletRequest";
import HttpServletResponse from "./HttpServletResponse";

export interface RequestDispatcher {

  forward(request: HttpServletRequest, response: HttpServletResponse): void

}