import type HttpServletRequest from "../servlets/http/HttpServletRequest";
import Exception from "./Exception";

export default class NoHandlerFoundException extends Exception {

  constructor(request:HttpServletRequest) {
    super(`No mapping for ${request.method} ${request.path}`);
  }

}