import HandlerMethodReturnValueHandler from "./HandlerMethodReturnValueHandler";
import ModelAndViewMethodReturnValueHandler from "./ModelAndViewMethodReturnValueHandler";
import RequestResponseBodyMethodProcessor from "./RequestResponseBodyMethodProcessor";

export default class ReturnValueHandlerRegistry {

  private readonly returnvalueHandlers: HandlerMethodReturnValueHandler[]

  constructor() {
    this.returnvalueHandlers = [
      new ModelAndViewMethodReturnValueHandler(),
      new RequestResponseBodyMethodProcessor()
    ]
  }

  get handlers() {
    return this.returnvalueHandlers;
  }

  addReturnValueHandler(handler: HandlerMethodReturnValueHandler) {
    this.returnvalueHandlers.push(handler);
  }
}