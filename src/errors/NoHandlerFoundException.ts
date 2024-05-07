import type HttpServletRequest from "../servlets/http/HttpServletRequest";

export default class NoHandlerFoundException extends Error {

  constructor(request:HttpServletRequest) {
    super(`No mapping for ${request.method} ${request.path}`);
  }

}