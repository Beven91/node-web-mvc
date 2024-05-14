import { RequestHeaders } from "../../interface/declare";
import HttpMethod from "../http/HttpMethod";
import HttpEntity from "./HttpEntity";

export default class RequestEntity<T = any> extends HttpEntity<T, RequestHeaders> {

  public url: string;

  public method: HttpMethod

  constructor(url: string, method: HttpMethod, data: T, headers: RequestHeaders) {
    super(data, headers);
    this.url = url;
    this.method = method;
  }

}