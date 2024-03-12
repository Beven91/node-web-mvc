/**
 * @module ResourceHttpRequestHandler
 * @description 静态资源请求处理器
 */
import path from 'path';
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
import ResourceTransformerChain from './ResourceTransformerChain';
import GzipResource from './GzipResource';
import ResourceResolverChain from './ResourceResolverChain';
import PathResourceResolver from './PathResourceResolver';
import ResourceResolver from './ResourceResolver';
import GzipGlobalResolver from './GzipGlobalResolver';
import UrlPathHelper from '../util/UrlPathHelper';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import AbstractHandlerMapping from '../mapping/AbstractHandlerMapping';

export default class ResourceHttpRequestHandler {

  // 当前对应的配置
  private readonly registration: ResourceHandlerRegistration

  // 允许使用的请求方式
  private allowHeaders = [HttpMethod.GET, HttpMethod.HEAD]

  private readonly resourceHttpMessageConverter: ResourceHttpMessageConverter

  private readonly resourceRegionHttpMessageConverter: ResourceRegionHttpMessageConverter

  private resourceResolverChain: ResourceResolverChain

  private resourceTransformerChain: ResourceTransformerChain

  public get urlPathHelper(): UrlPathHelper {
    const pathMatchConfigurer = WebMvcConfigurationSupport.configurer.pathMatchConfigurer;
    return pathMatchConfigurer.getUrlPathHelperOrDefault();
  }

  constructor(registration: ResourceHandlerRegistration) {
    this.registration = registration;
    this.resourceHttpMessageConverter = new ResourceHttpMessageConverter();
    this.resourceRegionHttpMessageConverter = new ResourceRegionHttpMessageConverter();
  }

  initResolversAndTransformers() {
    if (!this.resourceResolverChain) {
      const resolvers: Array<ResourceResolver> = [
        new PathResourceResolver(),
        new GzipGlobalResolver(),
      ];
      const transformers = [];
      if (this.registration.resourceChainRegistration) {
        resolvers.push(...this.registration.resourceChainRegistration.resolvers);
        transformers.push(...this.registration.resourceChainRegistration.transformers);
      }
      this.resourceResolverChain = new ResourceResolverChain(resolvers);
      this.resourceTransformerChain = new ResourceTransformerChain(transformers, this.resourceResolverChain);
    }
  }

  /**
   * 处理静态资源请求
   */
  async handleRequest(request: HttpServletRequest, response: HttpServletResponse): Promise<any> {
    this.initResolversAndTransformers();
    const servletContext = request.servletContext;
    // 校验请求
    const resource = await this.checkRequest(request, response);
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
    if (ranges === null || ranges == undefined) {
      // 非断点下载
      this.setHeaders(response, resource);
      await this.resourceHttpMessageConverter.write(resource, resource.mediaType, servletContext);
      return;
    }
    // 断点下载
    response.setHeader(HttpHeaders.ACCEPT_RANGES, 'bytes');
    try {
      const regions = ResourceRegion.getRangeRegions(request, resource);
      await this.resourceRegionHttpMessageConverter.write(regions, resource.mediaType, servletContext);
    } catch (ex) {
      response.setHeader("Content-Range", "bytes */" + resource.contentLength);
      response.sendError(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE);
    }
  }

  /**
   * 处理请求url
   * @param request 
   */
  processPath(request: HttpServletRequest) {
    const url = request.servletContext.getAttrigute(AbstractHandlerMapping.HANDLE_MAPPING_PATH);
    return decodeURIComponent(url.replace(/\\/g, '/').replace(/\/\//g, '/').replace(/^\//, ''));
  }

  /**
  * 根据请求对象对应的静态资源
  */
  async getResource(request: HttpServletRequest) {
    const resourcePath = this.processPath(request);
    const locations = this.registration.resourceLocations.map((url) => {
      url = url.endsWith(path.sep) ? url : url + path.sep;
      return new Resource(url);
    });
    const resource = await this.resourceResolverChain.resolveResource(request, resourcePath, locations);
    return this.resourceTransformerChain.transform(request, resource);
  }

  /**
   * 校验请求谓词
   */
  async checkRequest(request: HttpServletRequest, response: HttpServletResponse) {
    const resource = await this.getResource(request);
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