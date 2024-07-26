import hot from 'nodejs-hmr';
import WebMvcConfigurationSupport from './config/WebMvcConfigurationSupport';
import ModuleLoader from './util/ModuleLoader';
import GenericApplicationContext from './context/GenericApplicationContext';
import BeanDefinition from '../ioc/factory/BeanDefinition';
import { IncomingMessage, ServerResponse } from 'http';
import FilterDispatcher from './filter/FilterDispatcher';
import HttpServletRequest from './http/HttpServletRequest';
import HttpServletResponse from './http/HttpServletResponse';
import FilterHandlerAdapter from './filter/FilterHandlerAdapter';
import HttpStatus from './http/HttpStatus';
import DefaultListableBeanFactory from '../ioc/factory/DefaultListableBeanFactory';
import Javascript from '../interface/Javascript';
import { ClazzType } from '../interface/declare';
import AbstractApplicationContext from './context/AbstractApplicationContext';
import RuntimeAnnotation from './annotations/annotation/RuntimeAnnotation';
import Configuration from '../ioc/annotations/Configuration';
import { ConnectHandler } from './connector/HandlerConnector';
import NodeNativeConnector from './connector/NodeNativeConnector';
import RequestBodyReader from './http/body/RequestBodyReader';
import ApplicationDispatcher from './http/ApplicationDispatcher';
import BootConfiguration from './BootConfiguration';

export type ServletHandler = (request: IncomingMessage, response: ServerResponse, next: (error?: any) => any) => any;

export default class SpringApplication {
  public context: GenericApplicationContext;

  public configurer: WebMvcConfigurationSupport;

  private filterAdapter: FilterHandlerAdapter;

  private readonly primarySources: ClazzType[];

  constructor(...primarySources: ClazzType[]) {
    this.primarySources = primarySources;
    registerHotUpdate(this, this.initializeApplication.bind(this));
  }

  static run(primarySource: ClazzType, connect?: ConnectHandler): AbstractApplicationContext {
    return new SpringApplication(primarySource).run(connect);
  }

  /**
   * 尝试注入配置
   */
  tryInjectDefaultConfiguration(context: GenericApplicationContext) {
    const beanFactory = context.getBeanFactory();
    const configAnnos = RuntimeAnnotation.getAnnotations(Configuration);
    const configAnno = configAnnos.find((m) => Javascript.createTyper(m.ctor).isType(WebMvcConfigurationSupport));
    const SpringConfig = configAnno?.ctor;
    if (!SpringConfig) {
      // 如果没有自定义配置，则使用默认配置对象
      const definition = new BeanDefinition(WebMvcConfigurationSupport, null, 'singleton');
      const beanName = BeanDefinition.toBeanName(WebMvcConfigurationSupport);
      beanFactory.registerBeanDefinition(beanName, definition);
    }
  }

  /**
   * 加载所有模块
   */
  readyWorkprogress(cwd: string[], exclude?: string[]) {
    // 存储cacheKeys
    const cache = {};
    Object.keys(require.cache).forEach((k) => cache[k.replace(/\\/g, '/').toLowerCase()] = true);
    // 加载controller等
    cwd
      .filter(Boolean)
      .forEach((dir) => new ModuleLoader(dir, cache, exclude));
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

  private initializeApplication() {
    const bootConfig = new BootConfiguration(this.primarySources);
    // 装载所有模块
    this.readyWorkprogress(bootConfig.getScanBasePackages(), bootConfig.getExcludeScan());
    // 创建应用上下文
    const context = this.context = new GenericApplicationContext();
    const beanFactory = context.getBeanFactory();
    if (beanFactory instanceof DefaultListableBeanFactory) {
      beanFactory.setAllowBeanDefinitionOverridable(false);
    }
    // 默认配置处理
    this.tryInjectDefaultConfiguration(context);
    // 应用上下文刷新
    context.refresh();
    // 构建过滤器处理适配器
    this.filterAdapter = new FilterHandlerAdapter(beanFactory);
    this.filterAdapter.addFilter(new FilterDispatcher(context));
    const hotOptions = bootConfig.getHotOptions();
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && hotOptions) {
      // 启动热更新
      hot.run(hotOptions);
    }
    this.configurer = beanFactory.getBeansOfType(WebMvcConfigurationSupport)[0];
  }

  private handleRequest(nativeRequest: IncomingMessage, nativeResponse: ServerResponse, next: (error?: any) => any) {
    const configurer = this.configurer;
    if (nativeRequest.url.indexOf(configurer.base) !== 0) {
      return next();
    }
    const filterAdapter = this.filterAdapter;
    const reader = new RequestBodyReader(configurer.multipart);
    const createDispatcher = (path: string) => new ApplicationDispatcher(filterAdapter, path);
    const request = new HttpServletRequest(nativeRequest, configurer.contextPath, createDispatcher, reader);
    const response = new HttpServletResponse(nativeResponse);
    filterAdapter
      .doFilter(request, response)
      // 尝试404处理
      .then(() => this.onError(HttpStatus.NOT_FOUND, response, null))
      // 尝试500处理
      .catch((ex: Error) => this.onError(HttpStatus.INTERNAL_SERVER_ERROR, response, ex));
  }

  /**
   * 启动服务
   */
  run(connect?: ConnectHandler) {
    this.initializeApplication();
    // 如果自定义请求连接器，可用于接入到koa或者express之类的框架
    const configurer = this.configurer;
    const handleRequest = this.handleRequest.bind(this);
    if (connect) {
      connect(handleRequest, configurer);
    } else {
      // 默认使用node服务链接
      (new NodeNativeConnector()).connect(handleRequest, configurer);
    }
    return this.context;
  }
}

function registerHotUpdate(app: SpringApplication, refreshLifecycle: SpringApplication['initializeApplication']) {
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
        refreshLifecycle();
      }
    });
}
