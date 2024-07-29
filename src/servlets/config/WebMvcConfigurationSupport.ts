/**
 * @module WebAppConfigurer
 * @description 服务全局配置
 */
import HandlerInterceptorRegistry from '../interceptor/HandlerInterceptorRegistry';
import MessageConverter from '../http/converts/MessageConverter';
import ArgumentsResolvers from '../method/argument/ArgumentsResolvers';
import ViewResolverRegistry from '../view/ViewResolverRegistry';
import ResourceHandlerRegistry from '../resources/ResourceHandlerRegistry';
import PathMatchConfigurer from './PathMatchConfigurer';
import Bean from '../../ioc/annotations/Bean';
import RequestMappingHandlerMapping from '../mapping/RequestMappingHandlerMapping';
import BeanNameUrlHandlerMapping from '../mapping/BeanNameUrlHandlerMapping';
import ExceptionHandlerExceptionResolver from '../method/exception/ExceptionHandlerExceptionResolver';
import HandlerExceptionResolver from '../method/exception/HandlerExceptionResolver';
import HandlerExceptionResolverComposite from '../method/exception/HandlerExceptionResolverComposite';
import ResponseStatusExceptionResolver from '../method/exception/ResponseStatusExceptionResolver';
import DefaultHandlerExceptionResolver from '../method/exception/DefaultHandlerExceptionResolver';
import RequestMappingHandlerAdapter from '../mapping/RequestMappingHandlerAdapter';
import HandlerMethodReturnValueHandler from '../method/return/HandlerMethodReturnValueHandler';
import ModelAndViewMethodReturnValueHandler from '../method/return/ModelAndViewMethodReturnValueHandler';
import RequestResponseBodyMethodProcessor from '../method/processor/RequestResponseBodyMethodProcessor';
import WebAppConfigurerOptions, { DEFAULT_RESOURCE_MIME_TYPES, ResourceConfig } from './WebAppConfigurerOptions';
import InternalErrorHandler from '../http/error/InternalErrorHandler';
import { BeanFactory } from '../../ioc/factory/BeanFactory';
import HttpRequestHandlerAdapter from '../http/HttpRequestHandlerAdapter';
import HttpEntityMethodProcessor from '../method/processor/HttpEntityMethodProcessor';
import ModelAttributeMethodProcessor from '../method/processor/ModelAttributeMethodProcessor';
import ContentNegotiationManager from '../http/accept/ContentNegotiationManager';
import ByteArrayHttpMessageConverter from '../http/converts/ByteArrayHttpMessageConverter';
import StringHttpMessageConverter from '../http/converts/StringHttpMessageConverter';
import ResourceHttpMessageConverter from '../http/converts/ResourceHttpMessageConverter';
import ResourceRegionHttpMessageConverter from '../http/converts/ResourceRegionHttpMessageConverter';
import JsonMessageConverter from '../http/converts/JsonMessageConverter';
import MediaType from '../http/MediaType';
import AbstractHandlerMapping from '../mapping/AbstractHandlerMapping';
import CorsConfiguration from '../cors/CorsConfiguration';
import CorsRegistry from '../cors/CorsRegistry';
import OpenApiResolver from '../../swagger/resolver/OpenApiResolver';

export default class WebMvcConfigurationSupport extends WebAppConfigurerOptions {
  private messageConverters: MessageConverter;

  private argumentResolvers: ArgumentsResolvers;

  private returnvalueHandlers: HandlerMethodReturnValueHandler[];

  private contentNegotiationManager: ContentNegotiationManager;

  private pathMatchConfigurer: PathMatchConfigurer;

  private viewResolvers: ViewResolverRegistry;

  private beanFactory: BeanFactory;

  private resourceConfig: ResourceConfig;

  private corsConfigurations: Map<string, CorsConfiguration>;

  constructor(a?: WebAppConfigurerOptions) {
    super(a);
  }

  public getBeanFactory() {
    return this.applicationContext.getBeanFactory();
  }

  private getMessageConverters() {
    if (!this.messageConverters) {
      const messageConverters = new MessageConverter();
      this.configureMessageConverters?.(messageConverters);
      this.addDefaultHttpMessageConverters(messageConverters);
      this.extendMessageConverters?.(messageConverters);
      return messageConverters;
    } else {
      return this.messageConverters;
    }
  }

  private addDefaultHttpMessageConverters(converter: MessageConverter) {
    converter.addMessageConverters(
      new ByteArrayHttpMessageConverter(),
      new StringHttpMessageConverter(),
      new ResourceHttpMessageConverter(),
      new ResourceRegionHttpMessageConverter(),
      // SourceHttpMessageConverter
      new JsonMessageConverter(),
      // new DefaultMessageConverter(),
    );
  }

  private getPathMatchConfigurer() {
    if (!this.pathMatchConfigurer) {
      this.pathMatchConfigurer = new PathMatchConfigurer();
    }
    return this.pathMatchConfigurer;
  }

  private getArgumentResolvers() {
    if (!this.argumentResolvers) {
      const contentNegotiationManager = this.mvcContentNegotiationManager();
      this.argumentResolvers = new ArgumentsResolvers(this.getMessageConverters(), contentNegotiationManager);
      this.addArgumentResolvers?.(this.argumentResolvers);
    }
    return this.argumentResolvers;
  }

  private getReturnValueHandlers() {
    if (!this.returnvalueHandlers) {
      const messageConverters = this.getMessageConverters();
      const contentNegotiationManager = this.mvcContentNegotiationManager();
      this.returnvalueHandlers = [
        new ModelAndViewMethodReturnValueHandler(),
        new HttpEntityMethodProcessor(messageConverters, contentNegotiationManager),
        new ModelAttributeMethodProcessor(),
        new RequestResponseBodyMethodProcessor(messageConverters, contentNegotiationManager),
        new ModelAttributeMethodProcessor(false),
      ];
      this.addReturnValueHandlers?.(this.returnvalueHandlers);
    }
    return this.returnvalueHandlers;
  }

  private getViewResolvers() {
    if (!this.viewResolvers) {
      this.viewResolvers = new ViewResolverRegistry(this.getBeanFactory());
      this.configureViewResolvers?.(this.viewResolvers);
    }
    return this.viewResolvers;
  }

  private getResourceConfig() {
    if (!this.resourceConfig) {
      this.resourceConfig = {
        gzipped: this.resource?.gzipped == true,
        mimeTypes: String(this.resource?.mimeTypes || DEFAULT_RESOURCE_MIME_TYPES).split(',').map((str) => {
          return new MediaType(str);
        }),
      };
    }
    return this.resourceConfig;
  }

  private getCorsConfigurations() {
    if (!this.corsConfigurations) {
      const registry = new CorsRegistry();
      this.addCorsMappings(registry);
      this.corsConfigurations = registry.getCorsConfigurations();
    }
    return this.corsConfigurations;
  }

  private initHandlerMapping(handlerMapping: AbstractHandlerMapping) {
    const pathConfig = this.getPathMatchConfigurer();
    handlerMapping.setPathMatcher(pathConfig.getPathMatcherOrDefault());
    handlerMapping.setUrlPathHelper(pathConfig.getUrlPathHelperOrDefault());
    handlerMapping.setCorsConfigurations(this.getCorsConfigurations());
  }

  @Bean
  mvcContentNegotiationManager() {
    if (!this.contentNegotiationManager) {
      // 暂不实现configureContentNegotiation
      this.contentNegotiationManager = new ContentNegotiationManager();
    }
    return this.contentNegotiationManager;
  }

  @Bean
  mvcViewResolver() {
    return this.getViewResolvers();
  }

  @Bean
  requestMappingHandlerMapping() {
    const pathConfig = this.getPathMatchConfigurer();
    const handlerMapping = new RequestMappingHandlerMapping();
    const interceptorRegistry = new HandlerInterceptorRegistry();
    this.addInterceptors?.(interceptorRegistry);
    this.configurePathMatch?.(pathConfig);
    handlerMapping.setOrder(0);
    handlerMapping.setInterceptors(interceptorRegistry.getInterceptors());
    this.initHandlerMapping(handlerMapping);
    return handlerMapping;
  }

  @Bean
  resourceHandlerMapping() {
    const context = this.applicationContext;
    const registry = new ResourceHandlerRegistry();
    const resourceConfig = this.getResourceConfig();
    const handlerMapping = new BeanNameUrlHandlerMapping(registry, resourceConfig);
    handlerMapping.setOrder(100);
    // swagger 处理
    OpenApiResolver.initializeResource(registry, context.getBootConfig().getEanbleSwagger());
    // 注册额外的资源配置
    this.addResourceHandlers?.(registry);
    this.initHandlerMapping(handlerMapping);
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
      exceptionResolvers.push(new ExceptionHandlerExceptionResolver(returnValueHandlers, this.getBeanFactory()));
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
    handlerAdapter.setReturnvalueHandlers(this.getReturnValueHandlers());
    handlerAdapter.setArgumentResolver(this.getArgumentResolvers());
    return handlerAdapter;
  }

  @Bean
  resourceHandlerAdapter() {
    const adapter = new HttpRequestHandlerAdapter();
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
