import HttpStatus from "../servlets/http/HttpStatus";


export default class HttpStatusError extends Error {

  public readonly status: HttpStatus

  public readonly path: string

  constructor(status: HttpStatus, path: string) {
    super(`status=${status.code},reason=${status.message},path=${path}`);
    this.status = status;
    this.path = path;
  }
}