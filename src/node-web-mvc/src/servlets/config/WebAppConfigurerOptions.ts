import path from 'path';
import ResourceHandlerRegistry from '../resources/ResourceHandlerRegistry';
import PathMatchConfigurer from './PathMatchConfigurer';
import HandlerExceptionResolver from '../method/exception/HandlerExceptionResolver';
import HandlerMethodReturnValueHandler from '../method/return/HandlerMethodReturnValueHandler';
import HandlerInterceptorRegistry from '../interceptor/HandlerInterceptorRegistry';
import MessageConverter from '../http/converts/MessageConverter';
import ArgumentsResolvers from '../method/argument/ArgumentsResolvers';
import ViewResolverRegistry from '../view/ViewResolverRegistry';
import Bytes from '../util/Bytes';
import type MediaType from '../http/MediaType';
import CorsRegistry from '../cors/CorsRegistry';
import MultipartConfig from './MultipartConfig';
import ApplicationContextAware from '../context/ApplicationContextAware';
import AbstractApplicationContext from '../context/AbstractApplicationContext';

export const DEFAULT_RESOURCE_MIME_TYPES = 'application/javascript,text/css,application/json,application/xml,text/html,text/xml,text/plain';

export declare interface ResourceOptions {
  /**
   * 是否开启gzip压缩
   */
  gzipped: boolean
  /**
   * 开启gzip的媒体类型字符串
   * 例如: application/javascript,text/css
   */
  mimeTypes?: string
}

export interface ResourceConfig extends Omit<ResourceOptions, 'mimeTypes'> {
  mimeTypes: MediaType[]
}

export default class WebAppConfigurerOptions extends ApplicationContextAware {
  /**
   * 静态资源配置
   */
  public readonly resource?: ResourceOptions;

  /**
   * 当前配置的body内容大小
   * @param options
   */
  public readonly multipart?: MultipartConfig;


  /**
   * 默认为ioc容器设置的application context
   */
  protected applicationContext: AbstractApplicationContext;

  // 注册拦截器
  addInterceptors?(registry: HandlerInterceptorRegistry) { }

  // 添加视图解析器
  configureViewResolvers?(registry: ViewResolverRegistry) { }

  // 添加返回值处理器
  addReturnValueHandlers?(handlers: HandlerMethodReturnValueHandler[]) { }

  // 配置消息转换器
  configureMessageConverters?(converters: MessageConverter) { }

  // 添加http消息转换器
  extendMessageConverters?(converters: MessageConverter) { }

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

  // 全局配置跨域
  addCorsMappings?(registry: CorsRegistry) { }

  /**
   * 设置的application context
   * @param context
   */
  setApplication(context: AbstractApplicationContext): void {
    this.applicationContext = context;
  }

  constructor(a: WebAppConfigurerOptions) {
    super();
    const options = a || {} as WebAppConfigurerOptions;
    this.resource = options.resource;
    this.multipart = options.multipart || { maxFileSize: '', maxRequestSize: '' };
    this.multipart.maxFileSize = new Bytes(this.multipart.maxFileSize, '500kb').bytes;
    this.multipart.maxRequestSize = new Bytes(this.multipart.maxRequestSize, '500kb').bytes;
    const tmpRoot = this.multipart.mediaRoot || 'app_data/media';
    if (!path.isAbsolute(tmpRoot)) {
      this.multipart.mediaRoot = path.resolve(tmpRoot);
    } else {
      this.multipart.mediaRoot = tmpRoot;
    }
    if (a) {
      Object.keys(a).forEach((k) => {
        const handler = a[k];
        if (typeof handler == 'function') {
          this[k] = handler;
        }
      });
    }
  }
}
