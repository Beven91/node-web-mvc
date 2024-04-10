import http from 'http';
import https from 'https';
import http2 from 'http2';
import ResourceHandlerRegistry from '../resources/ResourceHandlerRegistry';
import PathMatchConfigurer from './PathMatchConfigurer';
import HandlerExceptionResolver from '../method/exception/HandlerExceptionResolver';
import HandlerMethodReturnValueHandler from '../method/return/HandlerMethodReturnValueHandler';
import HandlerInterceptorRegistry from '../interceptor/HandlerInterceptorRegistry';
import MessageConverter from '../http/converts/MessageConverter';
import ArgumentsResolvers from '../method/argument/ArgumentsResolvers';
import ViewResolverRegistry from '../view/ViewResolverRegistry';
import Bytes from '../util/Bytes';
import { HotOptions } from 'nodejs-hmr';

declare type RunMode = 'node' | 'express' | 'koa' | string

declare type HttpType = 'http' | 'https' | 'http2'

export declare interface Multipart {
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


const runtime = {
  defaultMimes: {
    gzipped: false,
    mimeTypes: 'application/javascript,text/css,application/json,application/xml,text/html,text/xml,text/plain',
  } as ResourceOptions
}

export declare interface ResourceOptions {
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

/**
   * 初始化配置的资源mimetypes,将字符串形式转换成对象形式
   * @param mimeTypes 
   */
const initializeMimeTypes = (mimeTypes: string | object) => {
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

export default class WebAppConfigurerOptions {
  public http?: HttpType

  /**
   * 使用node原生http服务时的配置参数
   */
  public serverOptions?: https.ServerOptions | http.ServerOptions | http2.ServerOptions

  /**
   * 获取启动目录
   */
  public readonly cwd: string | Array<string>

  /**
   * 获取当前服务中间件模式
   */
  public readonly mode?: RunMode

  /**
   * 静态资源配置
   */
  public readonly resource?: ResourceOptions

  /**
   * 获取当前网站启动端口号
   */
  public readonly port?: number

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
   * 当前配置的body内容大小
   * @param options 
   */
  public readonly multipart?: Multipart

  /**
   *  应用监听端口，且已启动时触发
   */
  onLaunch?: () => void

  // 注册拦截器
  addInterceptors?(registry: HandlerInterceptorRegistry) { }

  // 添加视图解析器
  configureViewResolvers?(registry: ViewResolverRegistry) { }

  // 添加返回值处理器
  addReturnValueHandlers?(handlers: HandlerMethodReturnValueHandler[]) { }

  // 添加http消息转换器
  addMessageConverters?(converters: MessageConverter) { }

  // 添加参数解析器
  addArgumentResolvers?(resolvers: ArgumentsResolvers) { }

  // 添加静态资源处理器
  addResourceHandlers?(registry: ResourceHandlerRegistry) { }

  // 提供扩展配置路径匹配相关
  configurePathMatch?(configurer: PathMatchConfigurer) { }

  // 配置异常解析器 可用于取代默认的解析器
  configureHandlerExceptionResolvers?(resolvers: HandlerExceptionResolver[]) { }

  // 扩展异常处理器
  extendHandlerExceptionResolvers?(resolvers: HandlerExceptionResolver[]) { }

  constructor(a: WebAppConfigurerOptions) {
    const options = a || {} as WebAppConfigurerOptions;
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
    this.resource.mimeTypes = initializeMimeTypes(this.resource.mimeTypes);
    this.multipart = options.multipart || { maxFileSize: '', maxRequestSize: '' };
    this.multipart.maxFileSize = new Bytes(this.multipart.maxFileSize, '500kb').bytes;
    this.multipart.maxRequestSize = new Bytes(this.multipart.maxRequestSize, '500kb').bytes;
  }
}