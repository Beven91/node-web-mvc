import hot, { } from '../hmr/src';
import WebMvcConfigurationSupport from './config/WebMvcConfigurationSupport';
import ModuleLoader from './util/ModuleLoader';
import GenericApplicationContext from './context/GenericApplicationContext';
import BeanDefinition from '../ioc/factory/BeanDefinition';
import { IncomingMessage, Server, ServerResponse } from 'http';
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
import Tracer from './annotations/annotation/Tracer';
import HotUpdaterReleaseManager from '../hmr/src/HotUpdaterReleaseManager';

export type ServletHandler = (request: IncomingMessage, response: ServerResponse, next: (error?: any) => any) => any;

export default class SpringApplication {
  public context: GenericApplicationContext;

  public configurer: WebMvcConfigurationSupport;

  private filterAdapter: FilterHandlerAdapter;

  private bootConfig: BootConfiguration;

  private hotUpdater: any;

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

  private initBootConfigs() {
    const bootConfig = this.bootConfig = new BootConfiguration(this.primarySources);
    const hotOptions = bootConfig.getHotOptions();
    this.hotUpdater?.close?.();
    if (hotOptions) {
      // 启动热更新
      this.hotUpdater = hot.run(hotOptions);
    }
    if (bootConfig.getLaunchLogOff() !== true) {
      const port = bootConfig.getPort();
      console.log(`
        -----------------------------------------------------------
        ====> Start Node-Mvc Server
        ====> Enviroment: development
        ====> Listening: port ${port}
        ====> Hot Module Update: ${this.hotUpdater ? 'eanbled' : 'disabled'}
        ====> Url: http://localhost:${port}/
        ====> Swagger: ${bootConfig.getEanbleSwagger() ? `http://localhost:${port}/swagger-ui/index.html` : 'disabled'}
        -----------------------------------------------------------
      `.split('\n').map((m) => m.trim()).join('\n'));
    }
    // 装载所有模块
    this.readyWorkprogress(bootConfig.getScanBasePackages(), bootConfig.getExcludeScan());
  }

  private initializeApplication() {
    // 创建应用上下文
    const context = this.context = new GenericApplicationContext(this.bootConfig);
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
    this.configurer = beanFactory.getBeansOfType(WebMvcConfigurationSupport)[0];
  }

  private handleRequest(nativeRequest: IncomingMessage, nativeResponse: ServerResponse, next: (error?: any) => any) {
    const serverOptions = this.bootConfig.getServerOptions();
    const base = serverOptions.base || '/';
    const configurer = this.configurer;
    if (nativeRequest.url.indexOf(base) !== 0) {
      return next();
    }
    const filterAdapter = this.filterAdapter;
    const reader = new RequestBodyReader(configurer.multipart);
    const createDispatcher = (path: string) => new ApplicationDispatcher(filterAdapter, path);
    const request = new HttpServletRequest(nativeRequest, base, createDispatcher, reader);
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
    this.initBootConfigs();
    this.initializeApplication();
    const serverOptions = this.bootConfig.getServerOptions();
    const handleRequest = this.handleRequest.bind(this);
    if (connect) {
      // 自定义服务链接
      connect(handleRequest, serverOptions).then(this.onConnected.bind(this));
    } else {
      // 默认使用node服务链接
      (new NodeNativeConnector()).connect(handleRequest, serverOptions).then(this.onConnected.bind(this));
    }
    return this.context;
  }

  private onConnected(server: Server) {
    HotUpdaterReleaseManager.push(() => server.close());
  }
}

function registerHotUpdate(app: SpringApplication, refreshLifecycle: SpringApplication['initializeApplication']) {
  hot
    .create(module)
    .clean()
    .postend((m) => {
      const tracer = Tracer.getTracer(app.configurer.constructor);
      if (tracer?.id === m.filename) {
        app.context?.getBeanFactory()?.destory?.();
        // 如果是配置文件更新，则需要重新初始化(并非重启服务，而是刷新掉上下文)
        refreshLifecycle();
      }
    });
}
