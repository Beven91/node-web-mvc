/**
 * @module WebAppConfigurer
 * @description 服务全局配置
 */
import path from 'path';
import glob from 'glob'
import bytes from 'bytes';
import OpenApi from '../swagger/openapi';
import HandlerInterceptorRegistry from './interceptor/HandlerInterceptorRegistry';
import MessageConverter from './http/converts/MessageConverter';
import ArgumentsResolvers from './method/argument/ArgumentsResolvers';
import ViewResolverRegistry from './view/ViewResolverRegistry';
import { RequestMappingAnnotation } from './annotations/mapping/RequestMapping';
import hot, { HotOptions } from 'nodejs-hmr';
import ResourceHandlerRegistry from './resources/ResourceHandlerRegistry';

const runtime = {
  configurer: null,
  cacheKeys: {},
  defaultMimeTypes: 'application/javascript,text/css,application/json,application/xml,text/html,text/xml,text/plain'
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

export declare class WebAppConfigurerOptions {
  // 端口
  port?: number
  // 当前类型
  mode: string
  // 是否开启swagger文档
  swagger?: boolean
  // 静态资源配置
  resource?: ResourceOptions
  // 基础路径
  base?: string
  // 配置请求内容大小
  multipart?: Multipart
  // 存放控制器的根目录
  cwd: string | Array<string>
  // 热更新配置
  hot?: HotOptions
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
  // 应用监听端口，且已启动
  onLaunch?: () => any
}

export default class WebAppConfigurer {

  /**
   * 参数解析器
   */
  public readonly argumentResolver: ArgumentsResolvers;

  /**
   * 消息转换器
   */
  public readonly messageConverters: MessageConverter

  /**
   * 视图解析器
   */
  public readonly viewResolvers: ViewResolverRegistry

  /**
   * 拦截器注册表
   */
  public readonly interceptorRegistry: HandlerInterceptorRegistry

  /**
   * 静态资源注册表
   */
  public readonly resourceHandlerRegistry: ResourceHandlerRegistry

  static get configurer(): WebAppConfigurer {
    if (!runtime.configurer) {
      runtime.configurer = new WebAppConfigurer();
    }
    return runtime.configurer;
  }

  /**
   * 获取启动目录
   */
  public get cwd() {
    return this.options.cwd;
  }

  /**
   * 获取当前服务中间件模式
   */
  public get mode() {
    return this.options.mode;
  }

  /**
   * 静态资源配置
   */
  public get resource() {
    return this.options.resource;
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

  public get onLaunch() {
    return this.options.onLaunch;
  }

  private options: WebAppConfigurerOptions;

  private constructor() {
    this.argumentResolver = new ArgumentsResolvers();
    this.messageConverters = new MessageConverter();
    this.viewResolvers = new ViewResolverRegistry();
    this.interceptorRegistry = new HandlerInterceptorRegistry();
    this.resourceHandlerRegistry = new ResourceHandlerRegistry();
    this.options = {
      mode: 'node',
      cwd: path.resolve('controllers'),
    }
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

  private launchSpringMvc(dir) {
    const cacheKeys = runtime.cacheKeys;
    const files = glob.sync(dir + '/**/*.*').filter((name) => {
      const ext = path.extname(name);
      return ext === '.js' || ext === '.ts';
    });
    files.forEach((name) => {
      if (!cacheKeys[name.toLowerCase()]) {
        require(name);
      }
    })
  }

  /**
   * 初始化配置
   * @param options 
   */
  initialize(options: WebAppConfigurerOptions) {
    // 热更新
    if (options.hot) {
      hot.run(options.hot);
    }
    // swagger 开启
    if (options.swagger !== false) {
      OpenApi.initialize();
    }
    // 注册拦截器
    if (options.addInterceptors) {
      options.addInterceptors(this.interceptorRegistry);
    }
    // 注册转换器
    if (options.addMessageConverters) {
      options.addMessageConverters(this.messageConverters);
    }
    // 注册参数解析器
    if (options.addArgumentResolvers) {
      options.addArgumentResolvers(this.argumentResolver);
    }
    // 注册视图解析器
    if (options.addViewResolvers) {
      options.addViewResolvers(this.viewResolvers);
    }
    // 注册静态资源
    if (options.addResourceHandlers) {
      options.addResourceHandlers(this.resourceHandlerRegistry);
    }
    this.options = options;
    this.options.resource = this.options.resource || { gzipped: false, mimeTypes: runtime.defaultMimeTypes };
    this.options.resource.mimeTypes = this.initializeMimeTypes(this.options.resource.mimeTypes);
    const dirs = options.cwd instanceof Array ? options.cwd : [options.cwd];
    // 初始化请求大小限制
    this.options.multipart = options.multipart || { maxFileSize: '', maxRequestSize: '' };
    this.multipart.maxFileSize = this.sizeFormat(this.multipart.maxFileSize, bytes.parse('500kb'));
    this.multipart.maxRequestSize = this.sizeFormat(this.multipart.maxRequestSize, bytes.parse('500kb'));
    // 存储cacheKeys
    Object.keys(require.cache).forEach((k) => runtime.cacheKeys[k.replace(/\\/g, '/').toLowerCase()] = true);
    // 加载controller等
    dirs.forEach((dir) => this.launchSpringMvc(dir))
    // 初始化没有配置class注解的mapping
    RequestMappingAnnotation.initializeUnClassMappings();
    return this;
  }

  initializeMimeTypes(mimeTypes: string | object) {
    mimeTypes = mimeTypes == null ? runtime.defaultMimeTypes : mimeTypes;
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

hot.create(module).accept(() => {
  // 子模块更新到此结束
});