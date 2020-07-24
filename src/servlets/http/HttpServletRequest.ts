/**
 * @module HttpServletRequest 
 * @description Http请求类
 */
import querystring from 'querystring';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import MediaType from './MediaType';
import HttpMethod from './HttpMethod';
import ServletContext from './ServletContext';

declare class Query {
  [propName: string]: any
}

declare class Cookies {
  [propName: string]: string | Array<string>
}

export default class HttpServletRequest {

  private _cookies: Cookies

  private request: IncomingMessage

  public get cookies() {
    return this._cookies;
  }

  /**
   * 当前请求上下文
   */
  public servletContext: ServletContext

  /**
   * 获取当前node原生请求对象
   */
  public get nativeRequest(): IncomingMessage {
    return this.request;
  }

  /**
   * 获取完整协议域名
   */
  public get fdomain() {
    const port = (this.port ? ':' + this.port : this.port);
    return this.protocol + '//' + this.host + port;
  }

  /**
   * 获取完整的url
   */
  public get url() {
    return this.nativeRequest.url;
  }

  /**
   * 获取当前请求完整path 不包含参数
   */
  public get baseUrl() {
    return this.fdomain + this.path;
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

  /**
  * 将可读流输送传入写出流
  */
  pipe(writeStream, options?) {
    this.nativeRequest.pipe(writeStream, options);
  }

  private parseCookie(cookieStr) {
    const cookies = {};
    (cookieStr || '').split(';').forEach((cookieKvs) => {
      const kv = cookieKvs.split('=');
      const name = (kv[0]).trim();
      const values = (kv[1] || '').split(',');
      cookies[name] = values.length < 2 ? values[0] : values;
    });
    return cookies;
  }

  constructor(request: IncomingMessage, servletContext: ServletContext) {
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
    this.servletContext = servletContext;
    this._cookies = this.parseCookie(request.headers['cookie']);
  }
}