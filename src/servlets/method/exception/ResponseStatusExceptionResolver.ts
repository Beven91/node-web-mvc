import ServletContext from "../../http/ServletContext";
import HandlerMethod from "../HandlerMethod";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class ResponseStatusExceptionResolver implements HandlerExceptionResolver {
  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}