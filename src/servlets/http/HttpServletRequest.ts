/**
 * @module HttpServletRequest 
 * @description Http请求类
 */
import querystring from 'querystring';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import MediaType from './MediaType';
import HttpMethod from './HttpMethod';

declare class Query {
  [propName: string]: any
}

export default class HttpServletRequest {

  private request: IncomingMessage

  /**
   * 获取当前node原生请求对象
   */
  public get nativeRequest(): IncomingMessage {
    return this.request;
  }

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
  public method: HttpMethod

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
   * 当前内容类型
   */
  public mediaType: MediaType

  /**
   * 当前pathVariables
   */
  public pathVariables: any

  /**
   * 请求头信息
   */
  public headers: IncomingHttpHeaders;

  /**
   * 当前正在读取的body内容
   */
  public body: any

  constructor(request: IncomingMessage) {
    const protocol = (request.connection as any).encrypted ? 'https' : 'http';
    const url = new URL(request.url, `${protocol}://${request.headers.host}`);
    this.headers = request.headers;
    this.method = HttpMethod[(request.method).toUpperCase()];
    this.protocol = protocol;
    this.request = request;
    this.query = querystring.parse(url.search.slice(1));
    this.host = url.hostname;
    this.port = url.port;
    this.path = url.pathname;
    this.mediaType = new MediaType(this.headers['content-type']);
  }
}