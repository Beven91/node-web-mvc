import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import HandlerMethod from "../HandlerMethod";

export default class HandlerMethodReturnValueHandlerComposite {

  private readonly returnvalueHandlers: HandlerMethodReturnValueHandler[]

  constructor(handlers: HandlerMethodReturnValueHandler[]) {
    this.returnvalueHandlers = handlers || [];
  }

  handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, method: HandlerMethod) {
    const handler = this.returnvalueHandlers.find((m) => m.supportsReturnType(returnType));
    if (!handler) {
      throw new Error('Unknow return value type:' + returnType.paramName);
    }
    return handler.handleReturnValue(returnValue, returnType, servletContext, method);
  }
}