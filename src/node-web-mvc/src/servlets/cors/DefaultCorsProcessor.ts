import HttpHeaders from '../http/HttpHeaders';
import HttpServletResponse from '../http/HttpServletResponse';
import CorsUtils from '../util/CorsUtils';
import CorsConfiguration from './CorsConfiguration';
import CorsProcessor from './CorsProcessor';
import HttpStatus from '../http/HttpStatus';
import HttpServletRequest from '../http/HttpServletRequest';


export default class DefaultCorsProcessor implements CorsProcessor {
  private tryAddVaryHeaders(response: HttpServletResponse) {
    response.addHeader(HttpHeaders.VARY, HttpHeaders.ORIGIN, true);
    response.addHeader(HttpHeaders.VARY, HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, true);
    response.addHeader(HttpHeaders.VARY, HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, true);
  }

  rejectResponse(response: HttpServletResponse) {
    response.setStatus(HttpStatus.FORBIDDEN);
    return response.fullResponse('Invalid CORS request', null);
  }

  async processRequest(config: CorsConfiguration, request: HttpServletRequest, response: HttpServletResponse): Promise<boolean> {
    // 添加缓存控制
    this.tryAddVaryHeaders(response);
    // 是否已处理
    const isHandled = !!response.getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
    // 不是跨域请求
    const isCrossRequest = CorsUtils.isCrossRequest(request);
    if (!isCrossRequest || isHandled) {
      // 如果不是跨域请求，或者已经处理
      return true;
    }

    const isPreFlightRequest = CorsUtils.isPreFlightRequest(request);
    // 在预请求时如果没有跨域配置，则直接返回false
    if (!config) {
      if (isPreFlightRequest) {
        this.rejectResponse(response);
        return false;
      }
      return true;
    }

    return this.handleInternal(request, response, config, isPreFlightRequest);
  }

  private getHeader(request: HttpServletRequest, name: string) {
    const value = request.getHeader(name);
    if (value instanceof Array) {
      return value;
    }
    return value.toString().split(',');
  }

  getMethodToUse(request: HttpServletRequest, isPrelightRequest: boolean) {
    return isPrelightRequest ? this.getHeader(request, HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD)?.[0] : request.method;
  }

  getHeadersToUse(request: HttpServletRequest, isPrelightRequest: boolean) {
    return isPrelightRequest ? this.getHeader(request, HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS) : Object.keys(request.headers);
  }

  checkOrigin(config: CorsConfiguration, requestOrigin: string) {
    return config.checkOrigin(requestOrigin);
  }

  checkHttpMethods(config: CorsConfiguration, requestMethod: string) {
    return config.checkHttpMethod(requestMethod);
  }

  checkHeaders(config: CorsConfiguration, requestHeaders: string[]) {
    return config.checkHeaders(requestHeaders);
  }

  async handleInternal(request: HttpServletRequest, response: HttpServletResponse, config: CorsConfiguration, isPreFlightRequest: boolean) {
    const requestOrigin = request.getHeaderValue(HttpHeaders.ORIGIN)?.[0];
    const allowOrigin = this.checkOrigin(config, requestOrigin);

    // 校验origin
    if (allowOrigin == null) {
      await this.rejectResponse(response);
      return false;
    }

    // 校验method
    const requestMethod = this.getMethodToUse(request, isPreFlightRequest);
    const allowMethods = this.checkHttpMethods(config, requestMethod);
    if (!allowMethods) {
      this.rejectResponse(response);
      return false;
    }

    // 校验请求头
    const requestHeaders = this.getHeadersToUse(request, isPreFlightRequest);
    const allowHeaders = this.checkHeaders(config, requestHeaders);
    if (isPreFlightRequest && allowHeaders == null) {
      this.rejectResponse(response);
      return false;
    }

    // 设置允许origin
    response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, allowOrigin);

    if (isPreFlightRequest) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, allowMethods);
    }

    if (isPreFlightRequest && allowHeaders.length > 0) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, allowHeaders);
    }

    if (config.exposedHeaders?.length > 0) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, config.exposedHeaders);
    }

    if (config.allowCredentials) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, true.toString());
    }

    if (config.allowPrivateNetwork) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_PRIVATE_NETWORK, true.toString());
    }

    if (isPreFlightRequest && config.maxAge) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_MAX_AGE, config.maxAge);
    }

    return true;
  }
}
