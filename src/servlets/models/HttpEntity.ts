/**
 * @module ResponseEntity
 */

import CacheControl from '../http/CacheControl';
import HttpHeaders from '../http/HttpHeaders';
import MediaType from '../http/MediaType';
import { RequestHeaders } from '../../interface/declare';

export default class HttpEntity<T = any, H = RequestHeaders> {
  public headers: H;

  public body: T;

  constructor(data: T, headers: H) {
    this.body = data;
    this.headers = (headers || {}) as H;
  }

  /**
   * 设置返回内容
   * @param data
   */
  setBody(data: T) {
    this.body = data;
    return this;
  }

  /**
   * 这是头部信息对象
   * @param headers
   */
  setHeaders(headers) {
    this.headers = headers;
    return this;
  }

  /**
   * 设置单个头部信息
   * @param key
   * @param values
   */
  setHeader(key: string, ...values: Array<string>) {
    this.headers[key] = values.join(',');
    return this;
  }

  /**
   * 设置头部信息 allows
   * @param HttpMethod
   * @param allowedMethods
   */
  setAllow(allowedMethods: Array<string>) {
    this.headers[HttpHeaders.ALLOW] = allowedMethods.join(',');
    return this;
  }

  /**
   * 设置返回etag
   */
  setETag(etag: string) {
    this.headers[HttpHeaders.ETAG] = etag;
    return this;
  }

  /**
   * 设置Last-Modified头部信息
   */
  setLastModified(lastModified: Date) {
    this.headers[HttpHeaders.LAST_MODIFIED] = lastModified.toUTCString();
    return this;
  }

  /**
   * 设置Location头部信息
   */
  setLocation(location: string) {
    this.headers[HttpHeaders.LOCATION] = location;
    return this;
  }

  /**
   * 配置缓存控制
   */
  setCacheControl(cacheControl: CacheControl) {
    if (cacheControl) {
      this.headers[HttpHeaders.CACHE_CONTROL] = cacheControl.toString();
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
  setVaryBy(requestHeaders: Array<string>) {
    this.headers[HttpHeaders.VARY] = requestHeaders.join(',');
    return this;
  }

  setContentLength(contentLength: number) {
    this.headers[HttpHeaders.CONTENT_LENGTH] = contentLength;
    return this;
  }

  setContentType(contentType: MediaType) {
    this.headers[HttpHeaders.CONTENT_TYPE] = contentType.toString();
    return this;
  }

  build() {
    this.body = null;
  }
}
