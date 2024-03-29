import ServletContext from "../../http/ServletContext";
import HandlerMethod from "../HandlerMethod";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class HandlerExceptionResolverComposite implements HandlerExceptionResolver {

  private exceptionResolvers: HandlerExceptionResolver[]

  setExeceptionResolvers(exceptionResolvers: HandlerExceptionResolver[]) {
    this.exceptionResolvers = exceptionResolvers;
  }

  getExceptionResolvers() {
    return this.exceptionResolvers || [];
  }

  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<boolean> {
    for (let resolver of this.getExceptionResolvers()) {
      const isHandled = await resolver.resolveException(servletContext, handler, error);
      if (isHandled) {
        console.info(`${resolver.constructor.name}: Resolved ${error.message}`)
        return isHandled;
      }
    }
  }
}