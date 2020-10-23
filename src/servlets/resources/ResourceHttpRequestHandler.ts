/**
 * @module ResourceHttpRequestHandler
 * @description 静态资源请求处理器
 */
import ResourceHandlerRegistration from './ResourceHandlerRegistration';
import HttpServletResponse from '../http/HttpServletResponse';

export default class ResourceHttpRequestHandler {

  private readonly registration: ResourceHandlerRegistration

  constructor(registration: ResourceHandlerRegistration) {
    this.registration = registration;
  }

  handleRequest(request: HttpServletResponse, response: HttpServletResponse) {

  }

}