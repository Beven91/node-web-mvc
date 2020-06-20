/**
 * @module HttpServletRequest 
 * @description Http请求类
 */
import urlparser from 'url';
import querystring from 'querystring';
import { IncomingMessage, IncomingHttpHeaders } from 'http';

declare class Query {
  [propName: string]: any
}

export default class HttpServletRequest {

  /**
   * 请求参数
   */
  public query: Query

  /**
   * 当前客户端请求域名
   */
  public host: string

  /**
   * 请求谓词
   */
  public method: string

  /**
   * 当前请求端口
   */
  public port: string

  /**
   * 当前请求路径
   */
  public path: string;

  /**
   * 当前请求协议
   */
  public protocol: string

  /**
   * 请求头信息
   */
  public headers: IncomingHttpHeaders;

  constructor(request: IncomingMessage) {
    const protocol = (request.connection as any).encrypted ? 'https' : 'http';
    const url = new URL(request.url, `${protocol}://${request.headers.host}`);
    this.headers = request.headers;
    this.method = request.method;
    this.protocol = protocol;
    this.query = url.searchParams;
    this.host = url.hostname;
    this.port = url.port;
    this.path = request.url;
  }
}