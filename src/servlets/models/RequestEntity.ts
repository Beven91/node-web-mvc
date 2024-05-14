import { RequestHeaders } from "../../interface/declare";
import HttpEntity from "./HttpEntity";

export default class RequestEntity<T = any> extends HttpEntity<T> {

  constructor(data: T, headers: RequestHeaders) {
    super(data, headers);
  }

}