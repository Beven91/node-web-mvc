/**
 * @module CacheControl
 * @description http缓存控制
 */

export default class CacheControl {

  /**
   * 表明响应可以被任何对象（包括：发送请求的客户端，代理服务器，等等）缓存，
   * 即使是通常不可缓存的内容。
   * （例如：1.该响应没有max-age指令或Expires消息头；2. 该响应对应的请求方法是 POST 。）
   */
  private isPublic: boolean

  /**
   * 表明响应只能被单个用户缓存，
   * 不能作为共享缓存（即代理服务器不能缓存它）。私有缓存可以缓存响应内容，比如：对应用户的本地浏览器。
   */
  private isPrivate: boolean

  /**
   * 在发布缓存副本之前，强制要求缓存把请求提交给原始服务器进行验证(协商缓存验证)。
   */
  private noCache: boolean

  /**
   * 缓存不应存储有关客户端请求或服务器响应的任何内容，即不使用任何缓存。
   */
  private noStore: boolean

  /**
   * 不得对资源进行转换或转变。
   * Content-Encoding、Content-Range、Content-Type等HTTP头不能由代理修改。
   * 例如，非透明代理或者如Google's Light Mode可能对图像格式进行转换，
   * 以便节省缓存空间或者减少缓慢链路上的流量。no-transform指令不允许这样做。
   */
  private noTransform: boolean

  /**
   * 设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。
   * 与Expires相反，时间是相对于请求的时间。
   */
  private maxAge: number

  /**
   * 覆盖max-age或者Expires头，但是仅适用于共享缓存(比如各个代理)，私有缓存会忽略它
   */
  private sMaxAge: number

  /**
   * 一旦资源过期（比如已经超过max-age），
   * 在成功向原始服务器验证之前，缓存不能用该资源响应后续请求。
   */
  private mustRevalidate: boolean


  /**
   * 与must-revalidate作用相同，但它仅适用于共享缓存（例如代理），并被私有缓存忽略
   */
  private proxyRevalidate: boolean

  constructor(options: CacheControl) {
    this.maxAge = options.maxAge;
    this.sMaxAge = options.sMaxAge;
    this.mustRevalidate = options.mustRevalidate;
    this.noTransform = options.noTransform;
    this.noStore = options.noStore;
    this.noCache = options.noCache;
    this.proxyRevalidate = options.proxyRevalidate;
    this.isPublic = options.isPublic;
    this.isPrivate = options.isPrivate;
  }

  toString() {
    const values = [];
    if (this.maxAge != null) {
      values.push(`max-age=${this.maxAge}`);
    }
    if (this.noCache) {
      values.push('no-cache');
    }
    if (this.noStore) {
      values.push('no-store');
    }
    if (this.mustRevalidate) {
      values.push('must-revalidate');
    }
    if (this.noTransform) {
      values.push('no-transform');
    }
    if (this.isPublic) {
      values.push('public');
    }
    if (this.isPrivate) {
      values.push('private');
    }
    if (this.proxyRevalidate) {
      values.push('proxy-revalidate');
    }
    if (this.sMaxAge != null) {
      values.push(`s-maxage=${this.sMaxAge}`);
    }
    return values.join(',');
  }
}