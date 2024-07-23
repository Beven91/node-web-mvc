import type HttpServletRequest from "../http/HttpServletRequest";
import type HttpServletResponse from "../http/HttpServletResponse";
import HandlerInterceptor from "../interceptor/HandlerInterceptor";
import CorsConfiguration from "./CorsConfiguration";
import CorsProcessor from "./CorsProcessor";

export default class CorsInterceptor extends HandlerInterceptor {

  private corsConfig: CorsConfiguration

  private processor: CorsProcessor

  constructor(corsConfig: CorsConfiguration, processor: CorsProcessor) {
    super();
    this.corsConfig = corsConfig;
    this.processor = processor;
  }

  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: object): boolean | Promise<boolean> {
    return this.processor.processRequest(this.corsConfig,request,response);
  }
}