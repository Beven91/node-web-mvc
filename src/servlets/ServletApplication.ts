import hot from 'nodejs-hmr';
import WebMvcConfigurationSupport from "./config/WebMvcConfigurationSupport";
import { DrivedServletContextClazz } from "./http/ServletContext";
import ModuleLoader from "./util/ModuleLoader";
import GenericApplicationContext from "./context/GenericApplicationContext";
import RuntimeAnnotation from "./annotations/annotation/RuntimeAnnotation";
import WebAppConfigurerOptions from "./config/WebAppConfigurerOptions";
import BeanDefinition from '../ioc/factory/BeanDefinition';
import { IncomingMessage, ServerResponse } from 'http';
import ServletDispatchFilter from './filter/ServletDispatchFilter';
import HttpServletRequest from './http/HttpServletRequest';
import HttpServletResponse from './http/HttpServletResponse';
import FilterHandlerAdapter from './filter/FilterHandlerAdapter';
import HttpStatus from './http/HttpStatus';

export default class ServletApplication {

  private contextClazz: DrivedServletContextClazz

  constructor(nativeHttpContextType: DrivedServletContextClazz) {
    this.contextClazz = nativeHttpContextType;
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

  private matchAndNormalizeUrl(request: IncomingMessage, base: string) {
    const protocol = (request.socket as any).encrypted ? 'https' : 'http';
    const url = new URL(request.url, `${protocol}://${request.headers.host}`);
    const path = new URL(url).pathname;
    if (path.indexOf(base) !== 0) {
      // 如果路径部匹配，则跳过
      return false;
    }
    const r = base ? path.replace(new RegExp('^' + base), '') : path;
    // 移除基础路径部分
    request.url = /^\//.test(r) ? r : '/' + r;
    return true;
  }

  connect(configurer: WebMvcConfigurationSupport, context: GenericApplicationContext, contextClazz: DrivedServletContextClazz) {
    const filterAdapter = new FilterHandlerAdapter();
    filterAdapter.addFilter(new ServletDispatchFilter(contextClazz, context, configurer));
    const handler = (nativeRequest: IncomingMessage, nativeResponse: ServerResponse, next: (error?: any) => any) => {
      if (!this.matchAndNormalizeUrl(nativeRequest, configurer.base)) {
        return next();
      }
      const request = new HttpServletRequest(nativeRequest, configurer.contextPath, filterAdapter, configurer.multipart);
      const response = new HttpServletResponse(nativeResponse);
      filterAdapter
        .doFilter(request, response)
        // 尝试404处理
        .then(() => this.onError(HttpStatus.NOT_FOUND, response, null))
        // 尝试500处理
        .catch((ex: Error) => this.onError(HttpStatus.INTERNAL_SERVER_ERROR, response, ex))
    }
    if (configurer.onLaunch) {
      configurer.onLaunch();
    }
    // 返回中间件
    return contextClazz.launch({ handler, config: configurer });
  }

  /**
   * 顶层异常兜底
   */
  private onError(status: HttpStatus, res: HttpServletResponse, ex: Error) {
    const response = res.nativeResponse;
    ex && console.error(ex);
    if (!response.writableFinished) {
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
    return this.connect(configurer, context, this.contextClazz);
  }
}