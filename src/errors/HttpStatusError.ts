import HttpStatus from "../servlets/http/HttpStatus";
import Exception from "./Exception";

export default class HttpStatusError extends Exception {

  public readonly status: HttpStatus

  public readonly path: string

  constructor(status: HttpStatus, path: string) {
    super(`status=${status.code},reason=${status.message},path=${path}`);
    this.status = status;
    this.path = path;
  }
}