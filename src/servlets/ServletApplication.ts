import { BeanFactory } from "../ioc/factory/BeanFactory";
import DispatcherServlet from "./DispatcherServlet";
import WebMvcConfigurationSupport, { WebAppConfigurerOptions } from "./config/WebMvcConfigurationSupport";
import HttpStatus from "./http/HttpStatus";
import ServletContext from "./http/ServletContext";
import InternalErrorHandler from "./http/error/InternalErrorHandler";
import { IncomingMessage, ServerResponse } from 'http';
import ModuleLoader from "./util/ModuleLoader";
import AbstractApplicationContext from "./context/AbstractApplicationContext";
import GenericApplicationContext from "./context/GenericApplicationContext";

class NativeHttpContext extends ServletContext { }

export default class ServletApplication {

  public readonly beanFactory: BeanFactory

  public readonly dispatcher: DispatcherServlet

  public readonly errorHandler: InternalErrorHandler

  private readonly configurer: WebMvcConfigurationSupport

  private readonly applicationContext: AbstractApplicationContext

  private nativeHttpContextType: typeof ServletContext

  constructor(nativeHttpContextType: typeof ServletContext, options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    this.nativeHttpContextType = nativeHttpContextType;
    this.configurer = WebMvcConfigurationSupport.initialize(options);
    this.applicationContext = new GenericApplicationContext();
    this.dispatcher = new DispatcherServlet(this.configurer);
    this.errorHandler = new InternalErrorHandler(this.applicationContext.getBeanFactory());
  }

  readyWorkprogress(cwd: Array<string>) {
    // 存储cacheKeys
    const cache = {};
    Object.keys(require.cache).forEach((k) => cache[k.replace(/\\/g, '/').toLowerCase()] = true);
    // 加载controller等
    cwd
      .filter(Boolean)
      .forEach((dir) => new ModuleLoader(dir, cache));
    // 根据注解注册mapping
  }

  private connect() {
    const configurer = this.configurer;
    const errorHandler = this.errorHandler;
    const ProxyHttpContext = this.nativeHttpContextType as typeof NativeHttpContext;
    const handler = (request: IncomingMessage, response: ServerResponse, next: (error?: any) => any) => {
      const protocol = (request.socket as any).encrypted ? 'https' : 'http';
      const url = new URL(request.url, `${protocol}://${request.headers.host}`);
      const path = new URL(url).pathname;
      if (path.indexOf(configurer.base) !== 0) {
        return next();
      }
      new Promise(
        (resolve) => {
          const context: ServletContext = new ProxyHttpContext(configurer, request, response, next, errorHandler, this.dispatcher);
          resolve(this.dispatcher.doService(context));
        }
      ).catch((ex: Error) => this.onError(ex, response))
    }
    if (this.configurer.onLaunch) {
      this.configurer.onLaunch();
    }
    // 返回中间件
    return NativeHttpContext.launch({ handler, config: configurer });
  }

  onError(ex: Error, response: ServerResponse) {
    console.error(ex);
    if (!response.writableFinished) {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const content = `HTTP Status ${status.code} - ${status.message}`;
      response.setHeader('content-type', 'text/html');
      response
        .writeHead(status.code, status.message)
        .end(
          `
            <html lang="en">
            <head>
              <title>${content}</title>
              <style type="text/css">body {font-family:Tahoma,Arial,sans-serif;} h1, h2, h3, b {color:white;background-color:#525D76;} h1 {font-size:22px;} h2 {font-size:16px;} h3 {font-size:14px;} p {font-size:12px;} a {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style>
            </head>
              <body>
                <h1>${content}</h1>
              </body>
            </html>
          `.trim()
        );
    }
  }

  run() {
    // 装载所有模块
    this.readyWorkprogress(this.configurer.workprogressPaths);
    // 应用上下文刷新
    this.applicationContext.refresh();
    // 开始连接到原生webserver服务
    return this.connect();
  }
}