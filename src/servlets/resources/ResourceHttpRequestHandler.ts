/**
 * @module ResourceHttpRequestHandler
 * @description 静态资源请求处理器
 */
import ResourceHandlerRegistration from './ResourceHandlerRegistration';
import HttpServletResponse from '../http/HttpServletResponse';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpMethod from '../http/HttpMethod';
import HttpRequestMethodNotSupportedException from '../../errors/HttpRequestMethodNotSupportedException';
import Resource from './Resource';
import HttpRequestValidation from '../http/HttpRequestValidation';
import ResourceCacheControl from './ResourceCacheControl';
import HttpHeaders from '../http/HttpHeaders';
import HttpResource from './HttpResource';
import HttpStatus from '../http/HttpStatus';
import ResourceHttpMessageConverter from './ResourceHttpMessageConverter';
import ResourceRegion from './ResourceRegion';
import ResourceRegionHttpMessageConverter from './ResourceRegionHttpMessageConverter';
import ResourceResolver from './ResourceResolver';
import ResourceTransformerChain from './ResourceTransformerChain';
import GzipResource from './GzipResource';

export default class ResourceHttpRequestHandler {

  // 当前对应的配置
  private readonly registration: ResourceHandlerRegistration

  // 允许使用的请求方式
  private allowHeaders = [HttpMethod.GET, HttpMethod.HEAD]

  private resourceHttpMessageConverter: ResourceHttpMessageConverter

  private resourceRegionHttpMessageConverter: ResourceRegionHttpMessageConverter

  private resourceTransformer = new ResourceTransformerChain()

  constructor(registration: ResourceHandlerRegistration) {
    this.registration = registration;
    this.resourceHttpMessageConverter = new ResourceHttpMessageConverter();
    this.resourceRegionHttpMessageConverter = new ResourceRegionHttpMessageConverter();
  }

  /**
   * 处理静态资源请求
   */
  handleRequest(request: HttpServletRequest, response: HttpServletResponse): any {
    const servletContext = request.servletContext;
    // 校验请求
    const resource = this.checkRequest(request, response);
    if (!resource) {
      return;
    }
    // 配置缓存
    new ResourceCacheControl(request, response, this.registration.cacheControl);
    // Head 请求支持
    if (request.method === HttpMethod.HEAD) {
      this.setHeaders(response, resource);
      response.end();
      return;
    }
    const ranges = request.getHeader(HttpHeaders.RANGE);
    if (!ranges) {
      // 非断点下载
      this.setHeaders(response, resource);
      this.resourceHttpMessageConverter.write(resource, resource.mediaType, servletContext);
      return;
    }
    // 断点下载
    response.setHeader(HttpHeaders.ACCEPT_RANGES, 'bytes');
    try {
      const regions = ResourceRegion.getRangeRegions(request, resource);
      this.resourceRegionHttpMessageConverter.write(regions, resource.mediaType, servletContext);
    } catch (ex) {
      response.setHeader("Content-Range", "bytes */" + resource.contentLength);
      response.sendError(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE);
    }
  }

  /**
  * 根据请求对象对应的静态资源
  */
  getResource(request: HttpServletRequest) {
    return this.resourceTransformer.transform(
      request,
      new ResourceResolver(this.registration).resolve(request)
    );
  }

  /**
   * 校验请求谓词
   */
  checkRequest(request: HttpServletRequest, response: HttpServletResponse) {
    const resource = this.getResource(request);
    if (null === resource) {
      // 返回404
      response.sendError(HttpStatus.NOT_FOUND);
      return;
    }
    if (request.method === HttpMethod.OPTIONS) {
      // 返回允许使用的方法
      response.setHeader('Allow', this.allowHeaders.join(','))
      response.end();
      return;
    }
    if (this.allowHeaders.indexOf(request.method) < 0) {
      throw new HttpRequestMethodNotSupportedException(request.method, this.allowHeaders);
    }
    const validation = new HttpRequestValidation(request, response);
    if (validation.checkNotModified(null, resource.lastModified)) {
      response.end();
      return;
    }
    return resource;
  }

  /**
   * 设置资源文件返回头
   */
  setHeaders(response: HttpServletResponse, resource: Resource) {
    // 设置content-length
    if (!(resource instanceof GzipResource)) {
      response.setHeader(HttpHeaders.CONTENT_LENGTH, resource.contentLength);
    }
    // 设置media-type
    if (resource.mediaType) {
      response.setHeader(HttpHeaders.CONTENT_TYPE, resource.mediaType.toString());
    }
    // accept-ranges 支持
    if (resource instanceof HttpResource) {
      const headers = resource.getResponseHeaders();
      const keys = Object.keys(headers);
      keys.forEach((name) => {
        response.setHeader(name, headers[name]);
      });
      response.setHeader(HttpHeaders.ACCEPT_RANGES, 'bytes');
    }
  }
}