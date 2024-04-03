import hot from 'nodejs-hmr';
import DispatcherServlet from "./DispatcherServlet";
import WebMvcConfigurationSupport from "./config/WebMvcConfigurationSupport";
import ServletContext from "./http/ServletContext";
import { IncomingMessage, ServerResponse } from 'http';
import ModuleLoader from "./util/ModuleLoader";
import GenericApplicationContext from "./context/GenericApplicationContext";
import RuntimeAnnotation from "./annotations/annotation/RuntimeAnnotation";
import WebAppConfigurerOptions from "./config/WebAppConfigurerOptions";
import HttpStatus from "./http/HttpStatus";
import BeanDefinition from '../ioc/factory/BeanDefinition';
import InternalErrorHandler from './http/error/InternalErrorHandler';

class NativeHttpContext extends ServletContext { }

export default class ServletApplication {

  private nativeHttpContextType: typeof ServletContext

  constructor(nativeHttpContextType: typeof ServletContext) {
    this.nativeHttpContextType = nativeHttpContextType;
  }

  /**
   * 创建配置实例
   */
  createWebMvcConfigurationSupport(options: WebMvcConfigurationSupport | WebAppConfigurerOptions, context: GenericApplicationContext) {
    const configurer = options instanceof WebMvcConfigurationSupport ? options : new WebMvcConfigurationSupport(options);
    if (configurer.hot) {
      // 启动热更新
      hot.run(configurer.hot);
      RuntimeAnnotation.isHotUpdate = true;
    }
    const definition = new BeanDefinition(WebMvcConfigurationSupport, () => configurer, 'singleton');
    context.getBeanFactory().registerBeanDefinition(WebMvcConfigurationSupport, definition);
    return configurer;
  }

  /**
   * 加载所有模块
   */
  readyWorkprogress(cwd: Array<string>) {
    // 存储cacheKeys
    const cache = {};
    Object.keys(require.cache).forEach((k) => cache[k.replace(/\\/g, '/').toLowerCase()] = true);
    // 加载controller等
    cwd
      .filter(Boolean)
      .forEach((dir) => new ModuleLoader(dir, cache));
  }

  /**
   * 连接到原生httpserver
   */
  private connect(configurer: WebMvcConfigurationSupport, context: GenericApplicationContext) {
    const errorHandler = context.getBeanFactory().getBeanOfType(InternalErrorHandler)[0];
    const dispatcher = new DispatcherServlet(context);
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
          const context: ServletContext = new ProxyHttpContext(configurer, request, response, next, errorHandler, dispatcher);
          resolve(dispatcher.doService(context));
        }
      ).catch((ex: Error) => this.onError(ex, response))
    }
    if (configurer.onLaunch) {
      configurer.onLaunch();
    }
    // 返回中间件
    return ProxyHttpContext.launch({ handler, config: configurer });
  }

  /**
   * 顶层异常兜底
   */
  onError(ex: Error, response: ServerResponse) {
    console.error(ex);
    if (!response.writableFinished) {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const content = `HTTP Status ${status.code} - ${status.message}`;
      response.setHeader('content-type', 'text/html');
      response
        .writeHead(
          status.code,
          status.message
        ).end(
          `<html lang="en">
          <head>
            <title>${content}</title>
            <style type="text/css">body {font-family:Tahoma,Arial,sans-serif;} h1, h2, h3, b {color:white;background-color:#525D76;} h1 {font-size:22px;} h2 {font-size:16px;} h3 {font-size:14px;} p {font-size:12px;} a {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style>
          </head>
            <body>
              <h1>${content}</h1>
            </body>
          </html>`
        );
    }
  }

  /**
   * 启动服务
   */
  run(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    const context = new GenericApplicationContext();
    const configurer = this.createWebMvcConfigurationSupport(options, context);
    // 装载所有模块
    this.readyWorkprogress(configurer.workprogressPaths);
    // 应用上下文刷新
    context.refresh();
    // 开始连接到原生webserver服务
    return this.connect(configurer, context);
  }
}