/**
 * @module HttpServletRequest 
 * @description Http请求类
 */
import querystring from 'querystring';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import MediaType from './MediaType';
import HttpMethod from './HttpMethod';
import ServletContext from './ServletContext';
import RequestMemoryStream from './RequestMemoryStream';
import FilterHandlerAdapter from '../filter/FilterHandlerAdapter';
import ApplicationDispatcher from './ApplicationDispatcher';
import RequestBodyReader from './body/RequestBodyReader';
import type { Multipart } from '../config/WebAppConfigurerOptions';
import { isEmpty } from '../util/ApiUtils';

declare class Query {
  [propName: string]: any
}

declare class Cookies {
  [propName: string]: string | Array<string>
}

const servletContextSymbol = Symbol('servletContext');
const filterAdapterSymbol = Symbol('filterAdapter');

export default class HttpServletRequest {

  private _cookies: Cookies

  private readonly request: IncomingMessage

  public get cookies() {
    return this._cookies;
  }

  /**
   * 当前请求上下文
   */
  public get servletContext() {
    return this[servletContextSymbol] as ServletContext;
  }

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

  public get requestUrl() {
    return this.fdomain + this.url;
  }

  private params: Map<any, any>

  /**
   * 设置属性值
   * @param name 属性名
   * @param value 属性值
   */
  public setAttribute(name: any, value: any) {
    this.params.set(name, value);
  }

  /**
   * 获取属性值
   * @param name 属性名称 
   */
  public getAttribute<T = any>(name) {
    return this.params.get(name) as T;
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

  public bodyReader: RequestBodyReader

  public readonly contextPath: string

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

  /**
   * 判断是否存在body
   */
  public get hasBody() {
    const method = this.method;
    return !(method === HttpMethod.HEAD || method === HttpMethod.GET)
  }

  constructor(request: IncomingMessage, contextPath: string, filterAdapter: FilterHandlerAdapter, multipart: Multipart) {
    const protocol = (request.socket as any).encrypted ? 'https' : 'http';
    const uRL = new URL(request.url, `${protocol}://${request.headers.host}`);
    this.headers = request.headers;
    this.method = HttpMethod[(request.method).toUpperCase()];
    this.protocol = protocol;
    this.request = request;
    this.query = querystring.parse(uRL.search.slice(1));
    this.host = uRL.hostname;
    this.port = uRL.port;
    this.path = uRL.pathname;
    this.contextPath = contextPath;
    this.mediaType = new MediaType(this.headers['content-type']);
    this._cookies = this.parseCookie(request.headers['cookie']);
    this.params = new Map<any, any>();
    this[filterAdapterSymbol] = filterAdapter;
    this.bodyReader = new RequestBodyReader(multipart);
  }

  setServletContext(context: ServletContext) {
    Object.defineProperty(this, servletContextSymbol, {
      value: context,
      writable: false,
      enumerable: false,
      configurable: false
    })
  }

  /**
   * 解析cookie
   * @param cookieStr 
   */
  private parseCookie(cookieStr): Cookies {
    const cookies = {};
    (cookieStr || '').split(/; */).forEach((kv) => {
      const pairs = kv.split('=');
      const name = pairs[0].trim();
      if (undefined === cookies[name]) {
        const value = (pairs[1] || '').trim();
        const values = value[0] === '"' ? value.slice(1, -1) : value;
        cookies[name] = values;
      }
    });
    return cookies;
  }

  public getHeader(name: string) {
    return this.nativeRequest.headers[(name || '').toLowerCase()]
  }

  public getHeaderValue(name: string) {
    const v = this.getHeader(name);
    return v instanceof Array ? v : isEmpty(v) ? [] : [v];
  }

  public getHeaderSingleValue(name: string) {
    const v = this.getHeader(name);
    if (v instanceof Array) {
      return v[0];
    }
    return v;
  }

  public getDateHeader(name) {
    const v = this.getHeader(name);
    if (v) {
      return Date.parse(v as string);
    }
    return null;
  }

  public getRequestDispatcher(path: string) {
    return new ApplicationDispatcher(this[filterAdapterSymbol], path);
  }

  /**
   * 读取body内容为buffer
   * @returns 
   */
  public readBodyAsBuffer() {
    return RequestMemoryStream.readBody(this)
  }
}