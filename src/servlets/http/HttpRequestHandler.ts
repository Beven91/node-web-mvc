import HttpServletRequest from "./HttpServletRequest";
import HttpServletResponse from "./HttpServletResponse";

export default interface HttpRequestHandler {

  handleRequest(request: HttpServletRequest, response: HttpServletResponse): Promise<void>

}