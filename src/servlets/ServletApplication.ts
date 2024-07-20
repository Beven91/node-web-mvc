import hot from 'nodejs-hmr';
import WebMvcConfigurationSupport from "./config/WebMvcConfigurationSupport";
import { DrivedServletContextClazz } from "./http/ServletContext";
import ModuleLoader from "./util/ModuleLoader";
import GenericApplicationContext from "./context/GenericApplicationContext";
import WebAppConfigurerOptions from "./config/WebAppConfigurerOptions";
import BeanDefinition from '../ioc/factory/BeanDefinition';
import { IncomingMessage, ServerResponse } from 'http';
import ServletDispatchFilter from './filter/ServletDispatchFilter';
import HttpServletRequest from './http/HttpServletRequest';
import HttpServletResponse from './http/HttpServletResponse';
import FilterHandlerAdapter from './filter/FilterHandlerAdapter';
import HttpStatus from './http/HttpStatus';
import DefaultListableBeanFactory from '../ioc/factory/DefaultListableBeanFactory';
import Javascript from '../interface/Javascript';

export default class ServletApplication {

  private contextClass: DrivedServletContextClazz

  public context: GenericApplicationContext;

  public configurer: WebMvcConfigurationSupport

  private filterAdapter: FilterHandlerAdapter

  constructor(nativeHttpContextType: DrivedServletContextClazz) {
    this.contextClass = nativeHttpContextType;
    registerHotUpdate(this, this.internalRun.bind(this));
  }

  /**
   * 创建配置实例
   */
  createWebMvcConfigurationSupport(options: WebMvcConfigurationSupport | WebAppConfigurerOptions, context: GenericApplicationContext) {
    const configurer = options instanceof WebMvcConfigurationSupport ? options : new WebMvcConfigurationSupport(options);
    configurer.beanFactory = context.getBeanFactory();
    if (configurer.hot) {
      // 启动热更新
      hot.run(configurer.hot);
    }
    const definition = new BeanDefinition(WebMvcConfigurationSupport, () => configurer, 'singleton');
    const beanName = BeanDefinition.toBeanName(WebMvcConfigurationSupport);
    context.getBeanFactory().registerBeanDefinition(beanName, definition);
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
    if (request.url.indexOf(base) !== 0) {
      // 如果路径部匹配，则跳过
      return false;
    }
    return true;
  }

  connect(configurer: WebMvcConfigurationSupport, contextClazz: DrivedServletContextClazz) {
    const handler = (nativeRequest: IncomingMessage, nativeResponse: ServerResponse, next: (error?: any) => any) => {
      if (!this.matchAndNormalizeUrl(nativeRequest, configurer.base)) {
        return next();
      }
      const filterAdapter = this.filterAdapter;
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
    if (!res.headersSent) {
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

  private internalRun(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    const context = this.context = new GenericApplicationContext();
    this.configurer = this.createWebMvcConfigurationSupport(options, context);
    const beanFactory = context.getBeanFactory();
    if (beanFactory instanceof DefaultListableBeanFactory) {
      beanFactory.setAllowBeanDefinitionOverridable(false);
    }
    // 装载所有模块
    this.readyWorkprogress(this.configurer.workprogressPaths);
    // 应用上下文刷新
    context.refresh();
    // 构建过滤器处理适配器
    this.filterAdapter = new FilterHandlerAdapter(context.getBeanFactory());
    this.filterAdapter.addFilter(new ServletDispatchFilter(this.contextClass, context));
  }

  /**
   * 启动服务
   */
  run(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    this.internalRun(options);
    // 开始连接到原生webserver服务
    return this.connect(this.configurer, this.contextClass);
  }
}

function registerHotUpdate(app: ServletApplication, refreshLifecycle: ServletApplication['internalRun']) {
  hot
    .create(module)
    .clean()
    .postend((m) => {
      const Configurer = m.exports?.default;
      if (Javascript.createTyper(Configurer).isType(WebMvcConfigurationSupport)) {
        app.context?.getBeanFactory()?.destory?.();
        const config = new Configurer();
        delete config.hot;
        // 如果是配置文件更新，则需要重新初始化(并非重启服务，而是刷新掉上下文)
        refreshLifecycle(config);
      }
    })
}