/**
 * @module ResourceCacheControl
 * @description 静态资源缓存配置
 */
import CacheControl from '../http/CacheControl';
import HttpHeaders from '../http/HttpHeaders';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';

export default class ResourceCacheControl {

  private readonly request: HttpServletRequest

  private readonly response: HttpServletResponse

  private readonly cacheControl: CacheControl

  constructor(request: HttpServletRequest, response: HttpServletResponse, cacheControl: CacheControl) {
    this.request = request;
    this.response = response;
    this.cacheControl = cacheControl;
    if (cacheControl) {
      this.applyCacheControl();
    }else{
      this.cacheControl = new CacheControl({} as any);
      this.applyCacheControl();
    }
  }

  applyCacheControl() {
    const response = this.response;
    const ccValue = this.cacheControl.toString();
    if (ccValue) {
      // Set computed HTTP 1.1 Cache-Control header
      response.setHeader(HttpHeaders.CACHE_CONTROL, ccValue);

      if (response.containsHeader(HttpHeaders.PRAGMA)) {
        // Reset HTTP 1.0 Pragma header if present
        response.setHeader(HttpHeaders.PRAGMA, "");
      }
      if (response.containsHeader(HttpHeaders.EXPIRES)) {
        // Reset HTTP 1.0 Expires header if present
        response.setHeader(HttpHeaders.EXPIRES, "");
      }
    }
  }
}