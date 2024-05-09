import ResponseStatusException from "../../../errors/ResponseStatusException";
import ResponseStatus from "../../annotations/ResponseStatus";
import RuntimeAnnotation from "../../annotations/annotation/RuntimeAnnotation";
import HttpStatus from "../../http/HttpStatus";
import ServletContext from "../../http/ServletContext";
import ModelAndView from "../../models/ModelAndView";
import HandlerMethod from "../HandlerMethod";
import HandlerExceptionResolver from "./HandlerExceptionResolver";

export default class ResponseStatusExceptionResolver implements HandlerExceptionResolver {
  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<ModelAndView> {
    try {
      if (error instanceof ResponseStatusException) {
        return this.resolveResponseStatusException(servletContext, handler, error);
      }

      const anno = RuntimeAnnotation.getClassAnnotation(error.constructor, ResponseStatus)?.nativeAnnotation;
      if (anno) {
        return this.resolveResponseStatus(anno.code, anno.reason, servletContext, handler, error);
      }
    } catch (ex) {
      console.warn(`${ResponseStatusExceptionResolver.name} resolveException failure`);
      console.warn(ex);
    }
    return null;
  }

  private resolveResponseStatusException(servletContext: ServletContext, handler: HandlerMethod, error: ResponseStatusException) {
    const response = servletContext.response;
    const headers = error.getResponseHeaders();
    Object.keys(headers).forEach((key) => {
      response.setHeader(key, headers[key]);
    })
    return this.resolveResponseStatus(error.code, error.reason, servletContext, handler, error);
  }

  private resolveResponseStatus(code: number, message: string, servletContext: ServletContext, handler: HandlerMethod, error: Error) {
    const response = servletContext.response;
    response.sendError(new HttpStatus(code,message));
    return new ModelAndView();
  }
}