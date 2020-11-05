/**
 * @module ResponseEntity
 */

import CacheControl from "../http/CacheControl";
import HttpHeaders from "../http/HttpHeaders";
import HttpStatus from "../http/HttpStatus";
import MediaType from "../http/MediaType";

export default class ResponseEntity<T> {

  public responseStatus: HttpStatus

  public responseHeaders: object

  public mediaType: MediaType

  public data: T

  static status(status: HttpStatus) {
    return new ResponseEntity(status);
  }

  static ok() {
    return new ResponseEntity(HttpStatus.OK);
  }

  constructor(status: HttpStatus);

  constructor(data: T, headers?, status?: HttpStatus) {
    if (data instanceof HttpStatus) {
      this.responseStatus = data;
    } else {
      this.data = data;
      this.responseStatus = status;
    }
    this.responseHeaders = headers || {};
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
   * 这是返回头对象
   * @param headers 
   */
  headers(headers) {
    this.responseHeaders = headers;
    return this;
  }

  /**
   * 设置单个返回头
   * @param key 
   * @param values 
   */
  header(key: string, ...values: Array<string>) {
    this.responseHeaders[key] = values.join(',');
    return this;
  }

  /**
   * 设置返回头 allows
   * @param HttpMethod 
   * @param allowedMethods 
   */
  allow(allowedMethods: Array<string>) {
    this.responseHeaders[HttpHeaders.ALLOW] = allowedMethods.join(',');
    return this;
  }

  /**
   * 设置返回etag
   */
  eTag(etag: string) {
    this.responseHeaders[HttpHeaders.ETAG] = etag;
    return this;
  }

  /**
   * 设置Last-Modified返回头
   */
  lastModified(lastModified: Date) {
    this.responseHeaders[HttpHeaders.LAST_MODIFIED] = lastModified.toUTCString();
    return this;
  }

  /**
   * 设置Location返回头
   */
  location(location: string) {
    this.responseHeaders[HttpHeaders.LOCATION] = location;
    return this;
  }

  /**
   * 配置缓存控制
   */
  cacheControl(cacheControl: CacheControl) {
    if (cacheControl) {
      this.responseHeaders[HttpHeaders.CACHE_CONTROL] = cacheControl.toString();
    }
    return this;
  }

  /**
   * 配置 Vary返回头
   * ```js
   *  .varBy('UserAgent','Cookie')
   * 
   * ```
   */
  varyBy(requestHeaders: Array<string>) {
    this.responseHeaders[HttpHeaders.VARY] = requestHeaders.join(',');
    return this;
  }

  contentLength(contentLength: number) {
    this.responseHeaders[HttpHeaders.CONTENT_LENGTH] = contentLength;
    return this;
  }

  contentType(contentType: MediaType) {
    this.mediaType = contentType;
    this.responseHeaders[HttpHeaders.CONTENT_TYPE] = contentType.toString();
    return this;
  }

  build() {
    this.data = null;
  }
}