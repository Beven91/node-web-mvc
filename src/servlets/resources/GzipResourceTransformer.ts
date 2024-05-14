/**
 * @module GzipResourceResolver
 * @description gzip资源解析器
 */

import HttpServletRequest from '../http/HttpServletRequest';
import Resource from './Resource';
import GzipResource from './GzipResource';
import type { ResourceConfig } from '../config/WebAppConfigurerOptions';
import ResourceTransformer from './ResourceTransformer';
import ResourceTransformerChain from './ResourceTransformerChain';
import HttpHeaders from '../http/HttpHeaders';

export default class GzipResourceTransformer implements ResourceTransformer {

  private config: ResourceConfig

  constructor(config: ResourceConfig) {
    this.config = config;
  }

  isAcceptable(resource: Resource, request: HttpServletRequest) {
    if (!this.config.gzipped) {
      // 如果没有开启gzip
      return false;
    }
    const acceptEncoding = request.getHeaderValue(HttpHeaders.ACCEPT_ENCODING).join(',')
    if (!/gzip/.test(acceptEncoding)) {
      // 如果客户端不支持gzip
      return false;
    }
    if (resource instanceof GzipResource) {
      // 如果当前强制返回GzipResource
      return false;
    }
    // 判定返回内容是否在白名单中
    return this.config.mimeTypes?.find((m) => m.isCompatibleWith(resource.mediaType));
  }

  async transform(request: HttpServletRequest, resource: Resource, chain: ResourceTransformerChain): Promise<Resource> {
    resource = await chain.transform(request,resource);
    if (!this.isAcceptable(resource, request)) {
      return resource;
    }
    return new GzipResource(resource);
  }
}