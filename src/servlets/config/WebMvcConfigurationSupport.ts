/**
 * @module WebAppConfigurer
 * @description 服务全局配置
 */
import OpenApi from '../../swagger/openapi';
import HandlerInterceptorRegistry from '../interceptor/HandlerInterceptorRegistry';
import MessageConverter from '../http/converts/MessageConverter';
import ArgumentsResolvers from '../method/argument/ArgumentsResolvers';
import ViewResolverRegistry from '../view/ViewResolverRegistry';
import ResourceHandlerRegistry from '../resources/ResourceHandlerRegistry';
import PathMatchConfigurer from './PathMatchConfigurer';
import Bean from '../../ioc/annotations/Bean';
import RequestMappingHandlerMapping from '../mapping/RequestMappingHandlerMapping';
import ResourceHandlerMapping from '../resources/ResourceHandlerMapping';
import ExceptionHandlerExceptionResolver from '../method/exception/ExceptionHandlerExceptionResolver';
import HandlerExceptionResolver from '../method/exception/HandlerExceptionResolver';
import HandlerExceptionResolverComposite from '../method/exception/HandlerExceptionResolverComposite';
import ResponseStatusExceptionResolver from '../method/exception/ResponseStatusExceptionResolver';
import DefaultHandlerExceptionResolver from '../method/exception/DefaultHandlerExceptionResolver';
import RequestMappingHandlerAdapter from '../method/RequestMappingHandlerAdapter';
import HandlerMethodReturnValueHandler from '../method/return/HandlerMethodReturnValueHandler';
import ModelAndViewMethodReturnValueHandler from '../method/return/ModelAndViewMethodReturnValueHandler';
import RequestResponseBodyMethodProcessor from '../method/argument/RequestResponseBodyMethodProcessor';
import WebAppConfigurerOptions from './WebAppConfigurerOptions';
import InternalErrorHandler from '../http/error/InternalErrorHandler';
import { BeanFactory } from '../../ioc/factory/BeanFactory';
import ResourceHandlerAdapter from '../resources/ResourceHandlerAdapter';

export default class WebMvcConfigurationSupport extends WebAppConfigurerOptions {

  private messageConverters: MessageConverter

  private argumentResolvers: ArgumentsResolvers

  private returnvalueHandlers: HandlerMethodReturnValueHandler[]

  private viewResolvers: ViewResolverRegistry

  public beanFactory: BeanFactory

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

  constructor(a?: WebAppConfigurerOptions) {
    super(a);
  }

  private getMessageConverters() {
    if (!this.messageConverters) {
      const messageConverters = new MessageConverter();
      this.addMessageConverters?.(messageConverters);
      return messageConverters;
    } else {
      return this.messageConverters;
    }
  }

  private getArgumentResolvers() {
    if (!this.argumentResolvers) {
      this.argumentResolvers = new ArgumentsResolvers(this.getMessageConverters());
      this.addArgumentResolvers?.(this.argumentResolvers);
    }
    return this.argumentResolvers;
  }

  private getReturnValueHandlers() {
    if (!this.returnvalueHandlers) {
      this.returnvalueHandlers = [
        new ModelAndViewMethodReturnValueHandler(this.mvcViewResolver()),
        new RequestResponseBodyMethodProcessor(this.getMessageConverters()),
      ];
      this.addReturnValueHandlers?.(this.returnvalueHandlers);
    }
    return this.returnvalueHandlers;
  }

  private getViewResolvers() {
    if (!this.viewResolvers) {
      this.viewResolvers = new ViewResolverRegistry(this.beanFactory);
      this.configureViewResolvers?.(this.viewResolvers);
    }
    return this.viewResolvers;
  }

  @Bean
  mvcViewResolver() {
    return this.getViewResolvers();
  }

  @Bean
  requestMappingHandlerMapping() {
    const pathMatchConfigurer = new PathMatchConfigurer();
    const handlerMapping = new RequestMappingHandlerMapping();
    const interceptorRegistry = new HandlerInterceptorRegistry();
    this.addInterceptors?.(interceptorRegistry);
    this.configurePathMatch?.(pathMatchConfigurer);
    // swagger 处理
    OpenApi.initializeApi(this.swagger);
    handlerMapping.setOrder(0);
    handlerMapping.setPathMatcher(pathMatchConfigurer.getPathMatcherOrDefault());
    handlerMapping.setUrlPathHelper(pathMatchConfigurer.getUrlPathHelperOrDefault());
    handlerMapping.setInterceptors(interceptorRegistry.getInterceptors());
    return handlerMapping;
  }

  @Bean
  resourceHandlerMapping() {
    const registry = new ResourceHandlerRegistry()
    const handlerMapping = new ResourceHandlerMapping(registry, this.resource);
    handlerMapping.setOrder(100);
    // swagger 处理
    OpenApi.initializeResource(registry, this.swagger);
    // 注册额外的资源配置
    this.addResourceHandlers?.(registry);
    return handlerMapping;
  }

  @Bean
  handlerExceptionResolver() {
    const exceptionResolvers: HandlerExceptionResolver[] = [];
    const composite = new HandlerExceptionResolverComposite();
    const returnValueHandlers = this.getReturnValueHandlers();
    this.configureHandlerExceptionResolvers?.(exceptionResolvers);
    if (exceptionResolvers.length < 1) {
      // 注册默认异常处理器
      exceptionResolvers.push(new ExceptionHandlerExceptionResolver(returnValueHandlers, this.beanFactory));
      exceptionResolvers.push(new ResponseStatusExceptionResolver());
      exceptionResolvers.push(new DefaultHandlerExceptionResolver());
    }
    // 扩展异常处理器
    this.extendHandlerExceptionResolvers?.(exceptionResolvers);
    composite.setExeceptionResolvers(exceptionResolvers);
    return composite;
  }

  @Bean
  requestMappingHandlerAdapter() {
    const handlerAdapter = new RequestMappingHandlerAdapter();
    handlerAdapter.setReturnvalueHandlers(this.getReturnValueHandlers())
    handlerAdapter.setArgumentResolver(this.getArgumentResolvers());
    return handlerAdapter;
  }

  @Bean
  resourceHandlerAdapter() {
    const adapter = new ResourceHandlerAdapter();
    return adapter;
  }

  @Bean
  internalErrorHandler() {
    return new InternalErrorHandler(
      this.beanFactory,
      this.getViewResolvers(),
    );
  }
}