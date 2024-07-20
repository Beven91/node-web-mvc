/**
 * @module HttpServletResponse
 * @description Http信息返回类
 */
import { ServerResponse } from 'http';
import HttpStatus from './HttpStatus';
import { emptyOf, isEmpty } from '../util/ApiUtils';
import HttpHeaders from './HttpHeaders';
import MediaType from './MediaType';
import { HttpHeaderValue } from '../../interface/declare';
import type ServletContext from './ServletContext';

const servletContextSymbol = Symbol('servletContext');

export default class HttpServletResponse {

  private tempStatusCode;

  private tempStatusMessage;

  startTime: number

  /**
   * nodejs原生ServerResponse
   */
  public readonly nativeResponse: ServerResponse

  /**
 * 当前请求上下文
 */
  public get servletContext() {
    return this[servletContextSymbol] as ServletContext;
  }

  /**
   * 判断返回头是否已经发送
   */
  public get headersSent() {
    return this.nativeResponse.headersSent;
  }

  public get status() {
    const code = this.statusCode;
    return HttpStatus.AllStatus.get(code) || new HttpStatus(code, this.statusMessage);
  }

  /**
   * 获取当前设置的返回状态编码
   */
  public get statusCode() {
    return this.tempStatusCode || this.nativeResponse.statusCode;
  }

  /**
   * 获取当i请安设置返回状态的描述信息
   */
  public get statusMessage() {
    return this.tempStatusMessage || this.nativeResponse.statusMessage;
  }

  /**
   * 获取已经设置的content-type
   */
  public get nativeContentType() {
    return this.nativeResponse.getHeader('content-type') as string;
  }

  private writeStatus() {
    if (!this.nativeResponse.headersSent) {
      this.nativeResponse.writeHead(this.tempStatusCode, this.tempStatusMessage);
    }
  }

  /**
   * 当前请求是否有错误
   */
  public get hasError() {
    return String(this.statusCode)[0] != '2';
  }

  /**
   * 获取设置的返回头
   * @param name 
   */
  getHeader(name: string) {
    return this.nativeResponse.getHeader((name || '').toLowerCase());
  }

  public getHeaderValue(name: string) {
    const v = this.getHeader(name);
    return v instanceof Array ? v : isEmpty(v) ? [] : [v];
  }

  addHeader(name: string, value: HttpHeaderValue, checkExists = false) {
    const values = this.getHeaderValue(name);
    const addValues = value instanceof Array ? value : [value];
    addValues.forEach((value) => {
      if (!(checkExists && values.indexOf(value as any) > -1)) {
        values.push(value);
      }
    })
    this.setHeader(name, values as string[]);
  }

  /**
   * 添加一个指定名称的返回头到返回头队列
   * @param {String} name 返回头名称
   * @param {String} value 返回头值
   */
  setHeader(name: string, value: HttpHeaderValue) {
    this.nativeResponse.setHeader(name, value);
    return this;
  }

  /**
   * 返回异常，结束请i去
   * @param name 
   */
  sendError(status: HttpStatus) {
    this.setStatus(status);
  }

  /**
   * 判断当前返回头中是否指定头
   */
  containsHeader(name: string) {
    return !!this.getHeader(name);
  }

  /**
   * 设置日期类型返回头
   */
  setDateHeader(name: string, value: number | Date) {
    const v = value instanceof Date ? value : new Date(value);
    this.nativeResponse.setHeader(name, v.toUTCString());
    return this;
  }

  /**
   * 设置返回状态
   * @param response 
   */
  setStatus(status: number | HttpStatus, statusMessage?) {
    if (status instanceof HttpStatus || (status && typeof status === 'object')) {
      this.tempStatusCode = status.code;
      this.tempStatusMessage = status.message;
    } else {
      this.tempStatusCode = status;
      this.tempStatusMessage = statusMessage;
    }
    return this;
  }

  /**
   * 移除指定返回头
   * @param name 返回头
   */
  removeHeader(name: string) {
    this.nativeResponse.removeHeader(name);
  }

  /**
   * 以安全方式将要写入的内容创建成一个buffer对象
   * @param data 
   * @returns {Buffer}
   */
  createBuffer(data: any) {
    if (data instanceof Buffer) {
      return data;
    }
    return Buffer.from(String(emptyOf(data, '')));
  }

  /**
   * 写出内容到客户端
   * @param response 
   */
  write(chunk: string | Buffer, encoding?: BufferEncoding) {
    this.writeStatus();
    const buffer = this.createBuffer(chunk);
    this.nativeResponse.write(buffer, encoding || 'utf-8');
  }

  /**
   * 结束请求
   * @param response 
   */
  end(content?: string | Buffer, encoding?: BufferEncoding) {
    const buffer = this.createBuffer(content);
    this.write(buffer, encoding);
    this.nativeResponse.end(undefined, encoding);
  }

  /**
   * 立即结束请求，并且设置返回内容与返回内容类型
   * 注意：此前不能调用response的 write与end函数
   * @param content 要返回的内容
   * @param mediaType 媒体类型
   * @param encoding 编码
   */
  async fullResponse(content: string | Buffer, mediaType: MediaType, encoding?: BufferEncoding) {
    const buffer = this.createBuffer(content);
    if (mediaType) {
      this.setHeader(HttpHeaders.CONTENT_TYPE, mediaType.toString());
    }
    this.setHeader(HttpHeaders.CONTENT_LENGTH, buffer.byteLength);
    return this.end(buffer, encoding);
  }

  /**
   * 执行http重定向
   * @param response 
   */
  sendRedirect(url, status = 302) {
    this.nativeResponse.writeHead(status, { 'Location': url })
  }

  getLastModifiedTime() {
    const n = this.getHeaderValue(HttpHeaders.LAST_MODIFIED)[0];
    const date = new Date(n);
    return date;
  }

  setServletContext(context: ServletContext) {
    Object.defineProperty(this,servletContextSymbol, {
      value: context,
      writable: false,
      enumerable: false,
      configurable: false
    })
  }

  constructor(response: ServerResponse) {
    this.nativeResponse = response;
  }
}