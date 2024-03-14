import ServletContext from "../../http/ServletContext";
import HandlerMethod from "../HandlerMethod";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class HandlerExceptionResolverComposite {

  private readonly exceptionResolvers: HandlerExceptionResolver[]

  constructor(handlers: HandlerExceptionResolver[]) {
    this.exceptionResolvers = handlers || [];
  }

  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<boolean> {
    for (let resolver of this.exceptionResolvers) {
      const isHandled = await resolver.resolveException(servletContext, handler, error);
      if (isHandled) {
        console.info(`${resolver.constructor.name}: Resolved ${error.message}`)
        return isHandled;
      }
    }
  }
}