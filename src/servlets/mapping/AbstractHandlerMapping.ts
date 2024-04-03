
/**
 * @module AbstractHandlerMapping
 * @description 抽象映射处理器
 */
import HandlerMapping from "./HandlerMapping";
import HandlerExecutionChain from '../interceptor/HandlerExecutionChain';
import ServletContext from '../http/ServletContext';
import HandlerInterceptor from '../interceptor/HandlerInterceptor';
import MappedInterceptor from '../interceptor/MappedInterceptor';
import HttpServletRequest from '../http/HttpServletRequest';
import UrlPathHelper from "../util/UrlPathHelper";
import PathMatcher from "../util/PathMatcher";
import ApplicationContextAware from "../context/ApplicationContextAware";
import AbstractApplicationContext from "../context/AbstractApplicationContext";
import Ordered from "../context/Ordered";

export default abstract class AbstractHandlerMapping extends ApplicationContextAware implements HandlerMapping, Ordered {

  protected urlPathHelper: UrlPathHelper = new UrlPathHelper();

  protected pathMatcher: PathMatcher = new PathMatcher();

  protected interceptors: HandlerInterceptor[]

  protected appContext: AbstractApplicationContext

  private order: number

  constructor() {
    super();
    // 扩展拦截器配置，使用于子类
    this.extendInterceptors();
  }

  static HANDLE_MAPPING_PATH = '@@HANDLE_MAPPING_PATH@@'

  public setUrlPathHelper(value: UrlPathHelper) {
    this.urlPathHelper = value;
  }

  public setPathMatcher(value: PathMatcher) {
    this.pathMatcher = value;
  }

  /**
   * 所有设置的拦截器
   */
  public setInterceptors(interceptors: HandlerInterceptor[]) {
    this.interceptors = interceptors;
    // TODO
    // return this.pathMatchConfigurer.interceptorRegistry.getInterceptors();
  }

  // 默认处理器,如果 getHandlerInternal 没有返回handler，则使用当前配置的默认处理器
  private defaultHandler: any

  /**
   * 从 this.interceptors 适配后拦截器
   * 由于在框架中，暂时不需要适配，所以直接返回this.interceptors
   */
  public get adaptedInterceptors(): Array<HandlerInterceptor> {
    return this.interceptors;
  }

  /**
   * 获取类型为匹配型拦截器列表
   */
  public get mappedInterceptors(): Array<MappedInterceptor> {
    const mappedInteceptors = this.interceptors.filter((interceptor) => interceptor instanceof MappedInterceptor);
    return (mappedInteceptors.length > 0 ? mappedInteceptors : null) as Array<MappedInterceptor>;
  }

  /**
   * 设置当前默认处理器
   * @param handler 处理器
   */
  public setDefaultHandler(handler) {
    this.defaultHandler = handler;
  }

  /**
   * 获取当前默认处理器
   */
  public getDefaultHandler() {
    return this.defaultHandler;
  }

  /**
   * 判断，当前是否使用路径匹配
   * 暂时：不使用
   */
  usesPathPatterns(): boolean {
    return true;
  }

  /**
   * 扩展拦截器,主要用于子类使用。
   */
  protected extendInterceptors() {

  }

  setApplication(context: AbstractApplicationContext): void {
    this.appContext = context;
  }

  /**
   * 根据当前请求对象获取 处理器执行链
   * @param context 请求上下文对象
   */
  getHandler(context: ServletContext): HandlerExecutionChain {
    const handler = this.getHandlerInternal(context) || this.getDefaultHandler();
    if (!handler) {
      return null;
    }
    // 获取拦截器执行链
    const chain = this.getHandlerExecutionChain(handler, context);
    // TODO: CORS...
    return chain;
  }

  /**
   * 根据当前request请求对象，获取对应的处理器
   */
  protected abstract getHandlerInternal(context: ServletContext): any

  protected initLookupPath(request: HttpServletRequest) {
    const url = this.urlPathHelper.getServletPath(request);
    request.servletContext.setAttribute(AbstractHandlerMapping.HANDLE_MAPPING_PATH, url);
    return url;
  }

  /**
   * 根据当前请求对应的处理器handler来获取对应的 拦截器执行链
   */
  protected getHandlerExecutionChain(handler: any, context: ServletContext): HandlerExecutionChain {
    const chain = handler instanceof HandlerExecutionChain ? handler : new HandlerExecutionChain(handler, context);
    if (/^\/swagger-ui\//.test(context.request.usePath)) {
      // swagger-ui 不介入
      return chain;
    }
    // 依次遍历拦截器，将拦截器添加到调用链。
    for (let interceptor of this.adaptedInterceptors) {
      if (interceptor instanceof MappedInterceptor) {
        interceptor.matches(context.request) ? chain.addInterceptor(interceptor) : undefined;
      } else {
        chain.addInterceptor(interceptor);
      }
    }
    return chain;
  }

  getOrder() {
    return this.order;
  }

  setOrder(value: number) {
    return this.order = value;
  }
}