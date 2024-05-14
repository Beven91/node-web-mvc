/**
 * @module ResponseEntity
 */

import CacheControl from "../http/CacheControl";
import HttpHeaders from "../http/HttpHeaders";
import MediaType from "../http/MediaType";
import { HttpHeaderValue } from "../../interface/declare";

export default class HttpEntity<T = any> {

  public httpHeaders: object

  public data: T

  constructor(data: T, headers: Record<string, HttpHeaderValue>) {
    this.data = data;
    this.httpHeaders = headers || {};
  }

  /**
   * 设置返回内容
   * @param data 
   */
  body(data: T) {
    this.data = data;
    return this;
  }

  /**
   * 这是头部信息对象
   * @param headers 
   */
  headers(headers) {
    this.httpHeaders = headers;
    return this;
  }

  /**
   * 设置单个头部信息
   * @param key 
   * @param values 
   */
  header(key: string, ...values: Array<string>) {
    this.httpHeaders[key] = values.join(',');
    return this;
  }

  /**
   * 设置头部信息 allows
   * @param HttpMethod 
   * @param allowedMethods 
   */
  allow(allowedMethods: Array<string>) {
    this.httpHeaders[HttpHeaders.ALLOW] = allowedMethods.join(',');
    return this;
  }

  /**
   * 设置返回etag
   */
  eTag(etag: string) {
    this.httpHeaders[HttpHeaders.ETAG] = etag;
    return this;
  }

  /**
   * 设置Last-Modified头部信息
   */
  lastModified(lastModified: Date) {
    this.httpHeaders[HttpHeaders.LAST_MODIFIED] = lastModified.toUTCString();
    return this;
  }

  /**
   * 设置Location头部信息
   */
  location(location: string) {
    this.httpHeaders[HttpHeaders.LOCATION] = location;
    return this;
  }

  /**
   * 配置缓存控制
   */
  cacheControl(cacheControl: CacheControl) {
    if (cacheControl) {
      this.httpHeaders[HttpHeaders.CACHE_CONTROL] = cacheControl.toString();
    }
    return this;
  }

  /**
   * 配置 Vary头部信息
   * ```js
   *  .varBy('UserAgent','Cookie')
   * 
   * ```
   */
  varyBy(requestHeaders: Array<string>) {
    this.httpHeaders[HttpHeaders.VARY] = requestHeaders.join(',');
    return this;
  }

  contentLength(contentLength: number) {
    this.httpHeaders[HttpHeaders.CONTENT_LENGTH] = contentLength;
    return this;
  }

  contentType(contentType: MediaType) {
    this.httpHeaders[HttpHeaders.CONTENT_TYPE] = contentType.toString();
    return this;
  }

  build() {
    this.data = null;
  }
}