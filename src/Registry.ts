import ServletExpressContext from './servlets/platforms/ServletExpressContext';
import ServletKoaContext from './servlets/platforms/ServletKoaContext';
import ServletNodeContext from './servlets/platforms/ServletNodeContext';
import ServletContext from './servlets/http/ServletContext';
import DispatcherServlet from './servlets/dispatch/DispatcherServlet';
import WebMvcConfigurationSupport, { WebAppConfigurerOptions } from './servlets/config/WebMvcConfigurationSupport';
import HttpStatus from './servlets/http/HttpStatus';
import { IncomingMessage, ServerResponse } from 'http';
import DefaultListableBeanFactory from './ioc/DefaultListableBeanFactory';
import InternalErrorHandler from './servlets/http/error/InternalErrorHandler';

const runtime = {
  isLaunched: false
}

declare class ContextRegistration {
  [propName: string]: typeof ServletContext
}

// 已经注册执行上下文
const registration: ContextRegistration = {}

export default class Registry {
  /**
   * 注册一个控制器上下文
   * @param {String} name 平台类型名
   * @param {Class} contextClass 控制器上下文类
   */
  static register(name: string, contextClass: typeof ServletContext) {
    registration[name] = contextClass;
  }

  /**
   * 启动mvc
   * @param {Express} app express实例 
   */
  static launch(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    if (!options) {
      throw new Error('请设置options属性,例如:' + JSON.stringify({ mode: 'express|koa' }));
    }
    if (runtime.isLaunched) {
      return console.error('服务已启动，请勿重复调用launch函数');
    }
    const beanFactory = new DefaultListableBeanFactory();
    // 初始化全局配置
    const configurer = WebMvcConfigurationSupport.initialize(options, beanFactory);
    // 获取当前中间件上下文
    const HttpContext = registration[configurer.mode || 'node'];
    const dispatcher = new DispatcherServlet(configurer);
    if (!HttpContext) {
      throw new Error(`
        当前${options.mode}模式不支持,
        您可以通过Registry.register来注册对应的执行上下文
        Registry.register('${options.mode}',ContextClass)
      `);
    }
    runtime.isLaunched = true;
    if (options.onLaunch) {
      options.onLaunch();
    }
    const errorHandler = new InternalErrorHandler(configurer);
    const handler = (request: IncomingMessage, response: ServerResponse, next: (error?: any) => any) => {
      const protocol = (request.socket as any).encrypted ? 'https' : 'http';
      const url = new URL(request.url, `${protocol}://${request.headers.host}`);
      const path = new URL(url).pathname;
      if (path.indexOf(configurer.base) !== 0) {
        return next();
      }
      new Promise((resolve) => {
        const HttpServletContext = HttpContext as any;
        const context: ServletContext = new HttpServletContext(configurer, request, response, next, errorHandler);
        resolve(dispatcher.doService(context));
      }).catch((ex) => {
        console.error(ex);
        if (!response.writableFinished) {
          const status = HttpStatus.INTERNAL_SERVER_ERROR;
          const content = `HTTP Status ${status.code} - ${status.message}`;
          response.setHeader('content-type', 'text/html');
          response
            .writeHead(
              status.code,
              status.message
            ).end(`<html lang="en">
              <head>
                <title>${content}</title>
                <style type="text/css">body {font-family:Tahoma,Arial,sans-serif;} h1, h2, h3, b {color:white;background-color:#525D76;} h1 {font-size:22px;} h2 {font-size:16px;} h3 {font-size:14px;} p {font-size:12px;} a {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style>
              </head>
                <body>
                  <h1>${content}</h1>
                </body>
              </html>`);
        }
      })
    }

    // 返回中间件
    return HttpContext.launch({ handler, config: configurer });
  }
}

// 注册express实现
Registry.register('express', ServletExpressContext);
// 注册koa实现
Registry.register('koa', ServletKoaContext);
// 注册node实现
Registry.register('node', ServletNodeContext);