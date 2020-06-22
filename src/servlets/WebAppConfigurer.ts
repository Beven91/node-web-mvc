/**
 * @module WebAppConfigurer
 * @description 服务全局配置
 */
import bytes from 'bytes';
import swagger from '../swagger';
import HandlerInteceptorRegistry from './interceptor/HandlerInteceptorRegistry';
import MessageConverter from './http/converts/MessageConverter';
import ArgumentsResolvers from './method/argument/ArgumentsResolvers';
import ViewResolverRegistry from './view/ViewResolverRegistry';

const runtime = {
  configurer: null
}

declare interface Multipart {
  /**
   * 上传单个文件的最大限制
   */
  maxFileSize: string | number,
  /**
   * 单个请求的最大限制
   */
  maxRequestSize: string | number
}

export declare class WebAppConfigurerOptions {
  // 端口
  port?: number
  // 当前类型
  mode: string
  // 是否开启swagger文档
  swagger?: boolean
  // 基础路径
  base?: string
  // 配置请求内容大小
  multipart?: Multipart
  // 注册拦截器
  addInterceptors?: (registry: typeof HandlerInteceptorRegistry) => void
  // 添加http消息转换器
  addMessageConverters?: (converters: MessageConverter) => void
  // 添加参数解析器
  addArgumentResolvers?: (resolvers: ArgumentsResolvers) => void
  // 添加视图解析器
  addViewResolvers?: (registry: ViewResolverRegistry) => void
}

export default class WebAppConfigurer {

  private constructor() {
    this.options = {
      mode: 'node'
    }
  }

  private options: WebAppConfigurerOptions;

  static get configurer(): WebAppConfigurer {
    if (!runtime.configurer) {
      runtime.configurer = new WebAppConfigurer();
    }
    return runtime.configurer;
  }

  /**
   * 获取当前服务中间件模式
   */
  public get mode() {
    return this.options.mode;
  }

  /**
   * 获取当前网站启动端口号
   */
  public get port() {
    return this.options.port;
  }

  /**
   * 获取当前网站的基础路由目录
   */
  public get contextPath() {
    return this.options.base;
  }

  /**
   * 当前配置的body内容大小
   * @param options 
   */
  public get multipart(): Multipart {
    return this.options.multipart;
  }

  /**
   * 格式化请求大小
   * @param size 
   * @param dv 
   */
  private sizeFormat(size, dv: number) {
    size = typeof size === 'string' && size ? bytes.parse(size) : size;
    return size == '' || isNaN(size) ? dv : size;
  }

  /**
   * 初始化配置
   * @param options 
   */
  initialize(options: WebAppConfigurerOptions) {
    // 注册拦截器
    if (options.addInterceptors) {
      options.addInterceptors(HandlerInteceptorRegistry);
    }
    // 注册转换器
    if (options.addMessageConverters) {
      options.addMessageConverters(MessageConverter);
    }
    // 注册参数解析器
    if (options.addArgumentResolvers) {
      options.addArgumentResolvers(ArgumentsResolvers);
    }
    // 注册视图解析器
    if (options.addViewResolvers) {
      options.addViewResolvers(ViewResolverRegistry);
    }
    if (options.swagger !== false) {
      // 如果使用swagger
      swagger.OpenApi.initialize();
    }
    this.options = options;
    // 初始化请求大小限制
    this.options.multipart = options.multipart || { maxFileSize: '', maxRequestSize: '' };
    this.multipart.maxFileSize = this.sizeFormat(this.multipart.maxFileSize, bytes.parse('500kb'));
    this.multipart.maxRequestSize = this.sizeFormat(this.multipart.maxRequestSize, bytes.parse('500kb'));
    return this;
  }
}