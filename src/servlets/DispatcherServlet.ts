/**
 * @module DispatcherServlet
 * @description controller请求执行入口
 */
import ServletContext from './http/ServletContext';
import ServletModel from './models/ServletModel';
import HandlerAdapter from './method/HandlerAdapter';
import HandlerExecutionChain from './interceptor/HandlerExecutionChain';
import InterruptModel from './models/InterruptModel';
import HandlerMapping from './mapping/HandlerMapping';
import NoRequestHandlerMapping from './mapping/NoRequestHandlerMapping';
import HttpRequestValidation from './http/HttpRequestValidation';
import HttpMethod from './http/HttpMethod';
import Normalizer from './../errors/Normalizer';
import HandlerExceptionResolverComposite from './method/exception/HandlerExceptionResolverComposite';
import HttpStatus from './http/HttpStatus';
import HttpStatusError from './../errors/HttpStatusError';
import AbstractApplicationContext from './context/AbstractApplicationContext';
import AbstractHandlerMapping from './mapping/AbstractHandlerMapping';
import InternalErrorHandler from './http/error/InternalErrorHandler';
import HandlerMethod from './method/HandlerMethod';

export default class DispatcherServlet {

  // 所有映射处理器
  private handlerMappings: Array<HandlerMapping>

  private handlerAdapters: Array<HandlerAdapter>

  private exceptionResolver: HandlerExceptionResolverComposite

  private readonly appContext: AbstractApplicationContext

  private fallbackErrorHandler: InternalErrorHandler;

  constructor(appContext: AbstractApplicationContext) {
    this.appContext = appContext;
    this.initStrategies();
  }

  getHandler(servletContext: ServletContext): HandlerExecutionChain {
    for (let handlerMapping of this.handlerMappings) {
      const executionChain = handlerMapping.getHandler(servletContext);
      if (executionChain) {
        return executionChain;
      }
    }
  }

  private initHandlerMappings() {
    this.handlerMappings = [
      ...this.appContext.getBeanFactory().getBeanOfType(AbstractHandlerMapping),
      new NoRequestHandlerMapping(),
      // RouterFunctionMapping  --> FilteredRouterFunctions
      // AbstractUrlHandlerMapping --> SimpleUrlHandlerMapping
      // AbstractHandlerMethodMapping --> RequestMappingInfoHandlerMapping --> RequestMappingHandlerMapping
      // AbstractDetectingUrlHandlerMapping
    ];
  }

  private initHandlerAdapters() {
    this.handlerAdapters = [
      ...this.appContext.getBeanFactory().getBeanOfType(HandlerAdapter),
    ];
  }

  private initExceptionResolvers() {
    this.exceptionResolver = this.appContext.getBeanFactory().getBeanOfType(HandlerExceptionResolverComposite)[0];
  }

  private initErrorHandler() {
    this.fallbackErrorHandler = this.appContext.getBeanFactory().getBeanOfType(InternalErrorHandler)[0];
  }

  private initStrategies() {
    this.initHandlerMappings();
    this.initExceptionResolvers();
    this.initHandlerAdapters();
    this.initErrorHandler();
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
      await this.doDispatch(servletContext);
    } catch (ex) {
      console.error(ex);
      servletContext.response.sendError(HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.fallbackErrorHandler?.tryResolveException?.(servletContext);
      servletContext.doReleaseQueues();
    }
  }

  async doDispatch(servletContext: ServletContext): Promise<ServletModel> {
    let handler = null;
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
      handler = mappedHandler.getHandler();
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
      runtime.result = await ha.handle(servletContext, handler);
      // 执行拦截器:postHandler
      await mappedHandler.applyPostHandle(runtime.result);
      // 判定http status
      await this.handleHttpStatus(servletContext, handler);
    } catch (ex) {
      ex = Normalizer.normalizeError(ex);
      runtime.error = ex;
      await this.handleException(ex, servletContext, handler);
    }
    process.nextTick(() => {
      // 执行拦截器: afterCompletion
      mappedHandler.applyAfterCompletion(runtime.error);
    });
    return runtime.result;
  }

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} servletContext 请求上下文
   */
  async handleException(error: Error, servletContext: ServletContext, handler: HandlerMethod) {
    const isHandled = await this.exceptionResolver.resolveException(servletContext, handler, error);
    if (!isHandled) {
      throw error;
    }
  }

  async handleHttpStatus(servletContext: ServletContext, handler: HandlerMethod) {
    const response = servletContext.response;
    if (!response.headersSent && response.hasError) {
      const error = new HttpStatusError(response.status, servletContext.request.path);
      return this.handleException(error, servletContext, handler);
    }
  }
}