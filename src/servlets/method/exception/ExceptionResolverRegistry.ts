import DefaultHandlerExceptionResolver from "./DefaultHandlerExceptionResolver";
import ExceptionHandlerExceptionResolver from "./ExceptionHandlerExceptionResolver";
import HandlerExceptionResolver from "./HandlerExceptionResolver";
import ResponseStatusExceptionResolver from "./ResponseStatusExceptionResolver";

export default class ExceptionResolverRegistry {

  private readonly exceptionResolvers: HandlerExceptionResolver[]

  constructor() {
    this.exceptionResolvers = [
      new ExceptionHandlerExceptionResolver(),
      new ResponseStatusExceptionResolver(),
      new DefaultHandlerExceptionResolver()
    ]
  }

  get handlers() {
    return this.exceptionResolvers;
  }

  addExceptionResolver(handler: HandlerExceptionResolver) {
    this.exceptionResolvers.push(handler);
  }
}