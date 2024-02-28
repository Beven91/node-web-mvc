/**
 * @module WebAppConfigurer
 * @description 服务全局配置
 */
import http from 'http';
import https from 'https';
import http2 from 'http2';
import OpenApi from '../../swagger/openapi';
import HandlerInterceptorRegistry from '../interceptor/HandlerInterceptorRegistry';
import MessageConverter from '../http/converts/MessageConverter';
import ArgumentsResolvers from '../method/argument/ArgumentsResolvers';
import ViewResolverRegistry from '../view/ViewResolverRegistry';
import { RequestMappingAnnotation } from '../annotations/mapping/RequestMapping';
import hot, { HotOptions } from 'nodejs-hmr';
import ResourceHandlerRegistry from '../resources/ResourceHandlerRegistry';
import ResourceHandlerMapping from '../resources/ResourceHandlerMapping';
import PathMatchConfigurer from './PathMatchConfigurer';
import Bytes from '../util/Bytes';
import ModuleLoader from '../util/ModuleLoader';
import Target from '../annotations/Target';

const runtime = {
  configurer: null,
  defaultMimes: {
    gzipped: false,
    mimeTypes: 'application/javascript,text/css,application/json,application/xml,text/html,text/xml,text/plain',
  } as ResourceOptions
}

declare type RunMode = 'node' | 'express' | 'koa' | string

declare type HttpType = 'http' | 'https' | 'http2'

declare interface Multipart {
  /**
   * 上传单个文件的最大限制
   */
  maxFileSize: string | number,
  /**
   * 单个请求的最大限制
   */
  maxRequestSize: string | number
  /**
  * 上传资源文件临时存储目录
  */
  tempRoot?: string
}

declare interface ResourceOptions {
  /**
   * 是否开启gzip压缩
   */
  gzipped: boolean
  /**
   * 开启gzip的媒体类型字符串
   * 例如: application/javascript,text/css
   */
  mimeTypes?: string | object
}

export declare interface WebAppConfigurerOptions {
  // 端口
  port?: number
  // 当前类型
  mode?: RunMode
  // 是否开启swagger文档
  swagger?: boolean
  // 静态资源配置
  resource?: ResourceOptions
  // 基础路径
  base?: string
  // 配置请求内容大小
  multipart?: Multipart
  // http服务类型
  http?: HttpType
  // 存放控制器的根目录
  cwd?: string | Array<string>
  // 热更新配置
  hot?: HotOptions
  serverOptions?: https.ServerOptions | http.ServerOptions | http2.ServerOptions
  // 注册拦截器
  addInterceptors?: (registry: HandlerInterceptorRegistry) => void
  // 添加http消息转换器
  addMessageConverters?: (converters: MessageConverter) => void
  // 添加参数解析器
  addArgumentResolvers?: (resolvers: ArgumentsResolvers) => void
  // 添加视图解析器
  addViewResolvers?: (registry: ViewResolverRegistry) => void
  // 添加静态资源处理器
  addResourceHandlers?: (registry: ResourceHandlerRegistry) => void
  // 配置路径匹配
  configurePathMatch?: (configurer: PathMatchConfigurer) => void
  // 应用监听端口，且已启动
  onLaunch?: () => any
}

export default class WebMvcConfigurationSupport implements WebAppConfigurerOptions {

  public readonly pathMatchConfigurer: PathMatchConfigurer

  public http?: HttpType

  /**
   * 使用node原生http服务时的配置参数
   */
  public serverOptions?: https.ServerOptions | http.ServerOptions | http2.ServerOptions

  /**
   * 参数解析器
   */
  public argumentResolver?: ArgumentsResolvers;

  /**
   * 消息转换器
   */
  public messageConverters?: MessageConverter

  /**
   * 视图解析器
   */
  public viewResolvers?: ViewResolverRegistry

  /**
   * 拦截器注册表
   */
  public interceptorRegistry?: HandlerInterceptorRegistry

  /**
   * 静态资源注册表
   */
  public resourceHandlerRegistry?: ResourceHandlerRegistry

  /**
   * 获取启动目录
   */
  public readonly cwd: string | Array<string>

  /**
   * 获取当前服务中间件模式
   */
  public readonly mode: RunMode

  /**
   * 静态资源配置
   */
  public readonly resource?: ResourceOptions

  /**
   * 获取当前网站启动端口号
   */
  public readonly port: number

  /**
   * 是否开启swagger文档
   */
  public readonly swagger?: boolean

  /**
   * 热更新配置
   */
  public readonly hot?: HotOptions

  /**
   * 获取当前网站的基础路由目录
   */
  public readonly base?: string

  /**
   * 获取当前网站的基础路由目录
   */
  public get contextPath() {
    return this.base || '/';
  }

  public get workprogressPaths(): Array<string> {
    if (!this.cwd) {
      return []
    }
    const cwd = this.cwd;
    return cwd instanceof Array ? cwd : [cwd];
  }

  /**
   * 当前配置的body内容大小
   * @param options 
   */
  public readonly multipart?: Multipart

  /**
   *  应用监听端口，且已启动时触发
   */
  public onLaunch: () => any

  private options: WebAppConfigurerOptions;

  static get configurer(): WebMvcConfigurationSupport {
    return runtime.configurer;
  }

  constructor(a?: WebAppConfigurerOptions) {
    const options = a || {} as WebAppConfigurerOptions;
    this.options = options;
    this.hot = options.hot;
    this.mode = options.mode || 'node';
    this.port = options.port || 8080;
    this.base = options.base || '/';
    this.onLaunch = options.onLaunch;
    this.http = options.http;
    this.serverOptions = options.serverOptions;
    this.swagger = 'swagger' in options ? options.swagger : true;
    this.cwd = options.cwd instanceof Array ? options.cwd : [options.cwd]
    this.resource = options.resource || runtime.defaultMimes;
    this.resource.mimeTypes = this.initializeMimeTypes(this.resource.mimeTypes);
    this.multipart = options.multipart || { maxFileSize: '', maxRequestSize: '' };
    this.multipart.maxFileSize = new Bytes(this.multipart.maxFileSize, '500kb').bytes;
    this.multipart.maxRequestSize = new Bytes(this.multipart.maxRequestSize, '500kb').bytes;
    this.pathMatchConfigurer = new PathMatchConfigurer();
  }

  // 注册拦截器
  public addInterceptors?(registry: HandlerInterceptorRegistry) {
    if (this.options.addInterceptors) {
      this.options.addInterceptors(registry);
    }
    this.interceptorRegistry = registry;
  }
  // 添加http消息转换器
  public addMessageConverters?(converters: MessageConverter) {
    if (this.options.addMessageConverters) {
      this.options.addMessageConverters(converters);
    }
    this.messageConverters = converters;
  }
  // 添加参数解析器
  public addArgumentResolvers?(resolvers: ArgumentsResolvers) {
    if (this.options.addArgumentResolvers) {
      this.options.addArgumentResolvers(resolvers);
    }
    this.argumentResolver = resolvers;
  }
  // 添加视图解析器
  public addViewResolvers?(registry: ViewResolverRegistry) {
    if (this.options.addViewResolvers) {
      this.options.addViewResolvers(registry);
    }
    this.viewResolvers = registry;
  }
  // 添加静态资源处理器
  public addResourceHandlers?(registry: ResourceHandlerRegistry) {
    if (this.options.addResourceHandlers) {
      this.options.addResourceHandlers(registry);
    }
    this.resourceHandlerRegistry = registry;
  }

  // 提供扩展配置路径匹配相关
  public configurePathMatch(configurer: PathMatchConfigurer) {
    if (this.options.configurePathMatch) {
      this.options.configurePathMatch(configurer);
    }
  }

  static readyWorkprogress(cwd: Array<string>) {
    // 存储cacheKeys
    const cache = {};
    Object.keys(require.cache).forEach((k) => cache[k.replace(/\\/g, '/').toLowerCase()] = true);
    // 加载controller等
    cwd
      .filter(Boolean)
      .forEach((dir) => new ModuleLoader(dir, cache));
    // 初始化没有配置class注解的mapping
    RequestMappingAnnotation.initializeUnClassMappings();
  }

  /**
   * 初始化配置
   * @param options 
   */
  static initialize(options: WebMvcConfigurationSupport | WebAppConfigurerOptions) {
    const configurer = options instanceof WebMvcConfigurationSupport ? options : new WebMvcConfigurationSupport(options);
    // 设置成全局配置
    runtime.configurer = configurer;
    // 热更新
    if (configurer.hot) {
      hot.run(options.hot);
      Target.generateTrace();
    }
    // 初始化配置
    this.initializeConfigurer(configurer);
    // 装载模块
    this.readyWorkprogress(configurer.workprogressPaths)
    return configurer;
  }

  static initializeConfigurer(configurer: WebMvcConfigurationSupport) {
    configurer.argumentResolver = new ArgumentsResolvers();
    configurer.messageConverters = new MessageConverter();
    configurer.viewResolvers = new ViewResolverRegistry();
    configurer.interceptorRegistry = new HandlerInterceptorRegistry();
    configurer.resourceHandlerRegistry = new ResourceHandlerRegistry();
    // 注册拦截器
    configurer.addInterceptors(configurer.interceptorRegistry);
    // 注册转换器
    configurer.addMessageConverters(configurer.messageConverters);
    // 注册参数解析器
    configurer.addArgumentResolvers(configurer.argumentResolver);
    // 注册视图解析器
    configurer.addViewResolvers(configurer.viewResolvers);
    // 配置路径匹配
    configurer.configurePathMatch(configurer.pathMatchConfigurer);
    // swagger 开启
    if (configurer.swagger !== false) {
      OpenApi.initialize();
    }
    // 注册静态资源
    configurer.addResourceHandlers(configurer.resourceHandlerRegistry);
  }

  /**
   * 初始化配置的资源mimetypes,将字符串形式转换成对象形式
   * @param mimeTypes 
   */
  initializeMimeTypes(mimeTypes: string | object) {
    mimeTypes = mimeTypes == null ? runtime.defaultMimes.mimeTypes : mimeTypes;
    if (typeof mimeTypes === 'object' && mimeTypes) {
      return mimeTypes;
    }
    const newMimeTypes = {};
    const values = (mimeTypes as string).split(',');
    values.forEach((k) => {
      const name = k.trim();
      newMimeTypes[name] = name;
    });
    return newMimeTypes;
  }
}

hot.create(module).accept((now, old) => {
  // 子模块更新到此结束
});

hot.create(require.main).accept((now, old) => {
  // 监听主模块热更新
  const type = old.exports.default || old.exports;
  const MvcConfigurer = now.exports.default || now.exports;
  if (typeof type === 'function' && type.prototype.__proto__.constructor === WebMvcConfigurationSupport) {
    // 如果是修改了配置文件 且是无参数构造
    if (MvcConfigurer.length === 0) {
      // 清空静态资源配置
      ResourceHandlerMapping.getInstance().getRegistration().clear();
      // 重新创建配置项
      const oldConfigurer = runtime.configurer as WebMvcConfigurationSupport;
      // 替换配置
      const newConfigurer = runtime.configurer = new MvcConfigurer();
      runtime.configurer = newConfigurer;
      WebMvcConfigurationSupport.initializeConfigurer(newConfigurer);
      if (oldConfigurer.cwd.toString() !== newConfigurer.cwd.toString()) {
        WebMvcConfigurationSupport.readyWorkprogress(newConfigurer.workprogressPaths);
      }
    }
  }
})