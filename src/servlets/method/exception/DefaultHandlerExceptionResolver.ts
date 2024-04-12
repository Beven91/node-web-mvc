import ValueConvertError from "../../../errors/ValueConvertError";
import ArgumentResolvError from "../../../errors/ArgumentResolvError";
import HttpStatusError from "../../../errors/HttpStatusError";
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
    if (this.isType(error, ArgumentResolvError, ValueConvertError, ParameterRequiredError)) {
      servletContext.response.sendError(HttpStatus.BAD_REQUEST);
      return true;
    } else if (error instanceof HttpStatusError) {
      servletContext.response.sendError(error.status);
      return true;
    }
    return false;
  }
}