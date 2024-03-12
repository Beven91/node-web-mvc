/**
 * @moduel HttpRequestValidation
 * @description http请求校验
 */

import RequestUtil from "../util/RequestUtil";
import HttpHeaders from "./HttpHeaders";
import HttpMethod from "./HttpMethod";
import HttpServletRequest from "./HttpServletRequest";
import HttpServletResponse from "./HttpServletResponse";
import HttpStatus from "./HttpStatus";

const etagRegex = new RegExp("\\*|\\s*((W\\/)?(\"[^\"]*\"))\\s*,?");

export default class HttpRequestValidation {

  private request: HttpServletRequest

  private response: HttpServletResponse

  private notModified: boolean

  constructor(request: HttpServletRequest, response: HttpServletResponse) {
    this.request = request;
    this.response = response;
    this.notModified = false;
  }

  normalizeTimestamp(lastModifiedTimestamp) {
    // 时间戳精度设置在 1s误差
    return parseInt((lastModifiedTimestamp / 1000).toString()) * 1000;
  }

  checkNotModified(etag: string, lastModifiedTimestamp: number) {
    const method = this.request.method;
    const isSafeMethod = method === HttpMethod.GET || method === HttpMethod.HEAD;
    // 1. 校验 if-unmodified-since
    if (this.validateIfUnmodifiedSince(lastModifiedTimestamp)) {
      if (this.notModified) {
        // 如果此时文件被修改了，这里需要设置返回412状态
        this.response.setStatus(HttpStatus.PRECONDITION_FAILED);
      }
      return this.notModified;
    }
    // 2. 校验: if-none-match
    if (!this.validateIfNoneMatch(etag)) {
      // 3. 校验: if-modified-since
      this.validateIfModifiedSince(lastModifiedTimestamp);
    }
    // 4. 进行304判定
    if (this.notModified) {
      const status = isSafeMethod ? HttpStatus.NOT_MODIFIED : HttpStatus.PRECONDITION_FAILED;
      this.response.setStatus(status);
    }
    // 5. 写出 last-modifed 以及 etag
    if (isSafeMethod) {
      if (lastModifiedTimestamp > 0 && !this.response.getHeader(HttpHeaders.LAST_MODIFIED)) {
        this.response.setDateHeader(HttpHeaders.LAST_MODIFIED, lastModifiedTimestamp);
      }
      if (etag && !this.response.getHeader(HttpHeaders.ETAG)) {
        etag = RequestUtil.padEtagIfNecessary(etag);
        this.response.setHeader(HttpHeaders.ETAG, etag);
      }
    }
    if (this.notModified) {
      this.response.end();
    }
    return this.notModified;
  }

  /**
   * 校验当前请求头中带 if-unmodified-since
   * @param lastModifiedTimestamp 资源最后修改时间
   */
  validateIfUnmodifiedSince(lastModifiedTimestamp: number) {
    const timestamp = this.normalizeTimestamp(lastModifiedTimestamp);
    // 获取if-unmodified-since值
    const ifUnmodifiedSince = RequestUtil.parseDataHeader(this.request, HttpHeaders.IF_UNMODIFIED_SINCE);
    if (ifUnmodifiedSince === -1 || timestamp < 0) {
      return false;
    }
    this.notModified = ifUnmodifiedSince < timestamp;
    return true;
  }

  /**
   * 校验if-none-match
   * @returns 当前etag是否匹配成功
   */
  validateIfNoneMatch(etag: string): boolean {
    const ifNoneMatch = this.request.getHeader(HttpHeaders.IF_NONE_MATCH);
    if (!etag || !ifNoneMatch) {
      return false;
    }
    etag = RequestUtil.padEtagIfNecessary(etag);
    if (etag.startsWith("W/")) {
      etag = etag.substring(2);
    }
    const match = (value: string) => {
      const r = value.match(etagRegex);
      return r && r[3] === etag;
    }
    const elements = ifNoneMatch instanceof Array ? ifNoneMatch : [ifNoneMatch];
    this.notModified = !!elements.find(match);
    return true;
  }

  /**
   * 校验if-modified-since
   */
  validateIfModifiedSince(lastModifiedTimestamp: number) {
    const ifModifiedSince = RequestUtil.parseDataHeader(this.request, HttpHeaders.IF_MODIFIED_SINCE);
    if (!ifModifiedSince || lastModifiedTimestamp < 0) {
      return false;
    }
    const timestamp = this.normalizeTimestamp(lastModifiedTimestamp);
    this.notModified = ifModifiedSince >= timestamp;
    return true;
  }
}