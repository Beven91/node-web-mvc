/**
 * @module ResponseEntity
 */

import HttpStatus from "../http/HttpStatus";
import MediaType from "../http/MediaType";
import HttpEntity from "./HttpEntity";
import { ResponseHeaders } from "../../interface/declare";

export default class ResponseEntity<T = any> extends HttpEntity<T, ResponseHeaders> {

  public responseStatus: HttpStatus

  public mediaType: MediaType

  static status(status: HttpStatus) {
    return new ResponseEntity(status);
  }

  static ok() {
    return new ResponseEntity(HttpStatus.OK);
  }

  constructor(data: T, headers: ResponseHeaders, status: HttpStatus)

  constructor(status: HttpStatus);

  constructor(data: T, headers?: ResponseHeaders, status?: HttpStatus) {
    super(data instanceof HttpStatus ? null : data, headers);
    if (data instanceof HttpStatus) {
      this.body = null;
      this.responseStatus = data;
    } else {
      this.body = data;
      this.responseStatus = status;
    }
  }
}