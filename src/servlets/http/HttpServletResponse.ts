/**
 * @module HttpServletResponse
 * @description Http信息返回类
 */
import { ServerResponse } from 'http';
import ServletContext from './ServletContext';

export default class HttpServletResponse {

  private tempStatusCode;

  private tempStatusMessage;

  /**
   * 当前请求对象
   */
  public get request() {
    return this.servletContext.request;
  }

  /**
   * nodejs原生ServerResponse
   */
  public readonly nativeResponse: ServerResponse

  /**
   * 当前请求上下文
   */
  public readonly servletContext: ServletContext

  /**
   * 判断返回头是否已经发送
   */
  public get headersSent() {
    return this.nativeResponse.headersSent;
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
    if (!this.headersSent) {
      this.nativeResponse.writeHead(this.tempStatusCode, this.tempStatusMessage);
    }
  }

  /**
   * 添加一个指定名称的返回头到返回头队列
   * @param {String} name 返回头名称
   * @param {String} value 返回头值
   */
  setHeader(name: string, value: string) {
    this.nativeResponse.setHeader(name, value);
  }

  /**
   * 设置返回状态
   * @param response 
   */
  setStatus(status, statusMessage?) {
    this.tempStatusCode = status;
    this.tempStatusMessage = statusMessage;
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
   * 写出内容到客户端
   * @param response 
   */
  write(chunk, callback?, encoding?) {
    this.writeStatus();
    this.nativeResponse.write(chunk === undefined ? '' : chunk, encoding || 'utf-8', callback);
  }

  /**
   * 结束输出
   * @param response 
   */
  end(data?, encoding?, callback?) {
    this.writeStatus();
    this.nativeResponse.end(data, encoding, callback);
  }

  /**
   * 执行http重定向
   * @param response 
   */
  sendRedirect(url, status = 302) {
    const request = this.request;
    const isAbs = /^(http|https):/.test(url);
    const isRoot = /^\//.test(url);
    const redirectUrl = isAbs ? url : isRoot ? request.fdomain + '/' + url : request.baseUrl + url;
    this.nativeResponse.writeHead(status, { 'Location': redirectUrl })
  }

  constructor(response: ServerResponse, servletContext: ServletContext) {
    this.nativeResponse = response;
    this.servletContext = servletContext;
  }
}