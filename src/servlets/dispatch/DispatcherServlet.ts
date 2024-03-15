/**
 * @module DispatcherServlet
 * @description controller请求执行入口
 */
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import HandlerAdapter from '../method/HandlerAdapter';
import HandlerExecutionChain from '../interceptor/HandlerExecutionChain';
import RequestMappingHandlerAdapter from '../method/RequestMappingHandlerAdapter';
import InterruptModel from '../models/InterruptModel';
import HandlerMapping from '../mapping/HandlerMapping';
import RequestMappingHandlerMapping from '../mapping/RequestMappingHandlerMapping'
import Middlewares from '../models/Middlewares';
import ResourceHandlerAdapter from '../resources/ResourceHandlerAdapter';
import ResourceHandlerMapping from '../resources/ResourceHandlerMapping';
import NoRequestHandlerMapping from '../mapping/NoRequestHandlerMapping';
import HttpRequestValidation from '../http/HttpRequestValidation';
import HttpMethod from '../http/HttpMethod';
import Normalizer from '../../errors/Normalizer';
import HandlerExceptionResolverComposite from '../method/exception/HandlerExceptionResolverComposite';
import InternalErrorHandler from './error/InternalErrorHandler';
import HttpStatus from '../http/HttpStatus';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import RuntimeAnnotation from '../annotations/annotation/RuntimeAnnotation';
import Component from '../../ioc/annotations/Component';
import BeanDefinition from '../../ioc/BeanDefinition';
import BeanOptions from '../../ioc/annotations/BeanOptions';

export default class DispatcherServlet {

  // 所有映射处理器
  private handlerMappings: Array<HandlerMapping>

  private handlerAdapters: Array<HandlerAdapter>

  constructor(configurer: WebMvcConfigurationSupport) {
    this.handlerMappings = [
      new RequestMappingHandlerMapping(configurer),
      new ResourceHandlerMapping(configurer),
      new NoRequestHandlerMapping(configurer),
      // RouterFunctionMapping  --> FilteredRouterFunctions
      // AbstractUrlHandlerMapping --> SimpleUrlHandlerMapping
      // AbstractHandlerMethodMapping --> RequestMappingInfoHandlerMapping --> RequestMappingHandlerMapping
      // AbstractDetectingUrlHandlerMapping
    ];

    this.handlerAdapters = [
      new RequestMappingHandlerAdapter(),
      new ResourceHandlerAdapter(),
    ];

    this.registerAllBeans(configurer);
  }

  registerAllBeans(configurer: WebMvcConfigurationSupport) {
    const beanFactory = configurer.beanFactory;
    const annotations = RuntimeAnnotation.getAnnotations(Component);
    annotations.forEach((annotation) => {
      const definition = new BeanDefinition(annotation.ctor);
      const name = annotation.nativeAnnotation.value;
      if (name) {
        beanFactory.registerBeanDefinition(name, definition);
      }
      beanFactory.registerBeanDefinition(BeanOptions.toBeanName(definition.ctor.name), definition);
      beanFactory.registerBeanDefinition(annotation.ctor, definition);
    });
  }

  getHandler(servletContext: ServletContext): HandlerExecutionChain {
    for (let handlerMapping of this.handlerMappings) {
      const executionChain = handlerMapping.getHandler(servletContext);
      if (executionChain) {
        servletContext.chain = executionChain;
        return executionChain;
      }
    }
  }

  /**
   * 根据当前处理的handler获取对应的处理适配器
   * @param handler 
   */
  getHandlerAdapter(handler): HandlerAdapter {
    return this.handlerAdapters.find((adapter) => adapter.supports(handler));
  }

  async doService(servletContext: ServletContext) {
    try {
      const model = await this.doDispatch(servletContext);
      if (model instanceof InterruptModel) {
        // 如果没有执行action,跳转到下一个
        servletContext.next()
      }
    } catch (ex) {
      if (servletContext.response.statusCode == 200) {
        // 如果是200状态，则需要设置成500
        servletContext.response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // 框架统一异常兜底
      await (new InternalErrorHandler()).resolveException(servletContext, ex);
    } finally {
      servletContext.doReleaseQueues();
    }
  }

  async doDispatch(servletContext: ServletContext): Promise<ServletModel> {
    const runtime = { result: null, error: null } as { result: ServletModel, error: Error }
    const mappedHandler = this.getHandler(servletContext);
    // 执行拦截器: preHandler
    const isKeeping = await mappedHandler?.applyPreHandle?.();
    if (!isKeeping) {
      // 如果拦截器中断了本次请求
      return new InterruptModel();
    }
    try {
      const request = servletContext.request;
      const response = servletContext.response;
      const handler = mappedHandler.getHandler();
      // 获取handler当前执行适配器
      const ha = this.getHandlerAdapter(handler);
      // 304处理
      if (request.method == HttpMethod.GET || request.method == HttpMethod.HEAD) {
        const validation = new HttpRequestValidation(request, response);
        const lastModified = ha.getLastModified(request, handler);
        if (validation.checkNotModified(null, lastModified)) {
          return;
        }
      }
      // 开始执行handler
      const result = await ha.handle(servletContext, handler);
      runtime.result = await this.applyMiddlewares(servletContext, result);
      // 执行拦截器:postHandler
      await mappedHandler.applyPostHandle(runtime.result);
    } catch (ex) {
      ex = Normalizer.normalizeError(ex);
      runtime.error = ex;
      await this.handleException(ex, servletContext);
    }
    process.nextTick(() => {
      // 执行拦截器: afterCompletion
      mappedHandler.applyAfterCompletion(runtime.error);
    });
    return runtime.result;
  }

  /**
   * 返回结果中间件处理。
   * @param servletContext 
   */
  async applyMiddlewares(servletContext: ServletContext, data) {
    const { request, response } = servletContext;
    if (data instanceof Middlewares) {
      data = await data.execute(request, response)
    }
    const isEmpty = servletContext.isNextInvoked && data === undefined;
    return isEmpty ? new InterruptModel() : new ServletModel(data);
  }

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} servletContext 请求上下文
   */
  async handleException(error: Error, servletContext: ServletContext) {
    const exceptionResolvers = servletContext.configurer.exceptionRegistry.handlers;
    const resolver = new HandlerExceptionResolverComposite(exceptionResolvers);
    const isHandled = await resolver.resolveException(servletContext, servletContext.chain.getHandler(), error);
    if (!isHandled) {
      throw error;
    }
  }
}