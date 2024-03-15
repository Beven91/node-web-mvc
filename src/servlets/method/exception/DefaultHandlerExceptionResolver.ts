import ArgumentConvertError from "../../../errors/ArgumentConvertError";
import ArgumentResolvError from "../../../errors/ArgumentResolvError";
import ParameterRequiredError from "../../../errors/ParameterRequiredError";
import HttpStatus from "../../http/HttpStatus";
import ServletContext from "../../http/ServletContext";
import HandlerMethod from "../HandlerMethod";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class DefaultHandlerExceptionResolver implements HandlerExceptionResolver {

  isType(error: Error, ...errorTypes: any[]) {
    return errorTypes.find((errorType) => errorType && error instanceof errorType);
  }

  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<boolean> {
    if (this.isType(error, ArgumentResolvError, ArgumentConvertError, ParameterRequiredError)) {
      servletContext.response.sendError(HttpStatus.BAD_REQUEST);
      return true;
    }
    return false;
  }
}