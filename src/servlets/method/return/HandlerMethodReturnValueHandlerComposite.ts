import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import HandlerMethod from "../HandlerMethod";
import UnsupportReturnValueHandlerError from "../../../errors/UnsupportReturnValueHandlerError";

export default class HandlerMethodReturnValueHandlerComposite {

  private readonly returnvalueHandlers: HandlerMethodReturnValueHandler[]

  constructor(handlers: HandlerMethodReturnValueHandler[]) {
    this.returnvalueHandlers = handlers || [];
  }

  handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, method: HandlerMethod) {
    const handler = this.returnvalueHandlers.find((m) => m.supportsReturnType(returnType));
    if (!handler) {
      const path = servletContext.request.path;
      throw new UnsupportReturnValueHandlerError(`Unknow return value type:${returnType.parameterType} @${path}`, returnValue);
    }
    return handler.handleReturnValue(returnValue, returnType, servletContext, method);
  }
}