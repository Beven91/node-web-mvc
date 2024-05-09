/**
 * @module DispatcherServlet
 * @description 处理http请求
 */
import ServletContext from './http/ServletContext';
import HandlerAdapter from './method/HandlerAdapter';
import HandlerExecutionChain from './interceptor/HandlerExecutionChain';
import HandlerMapping from './mapping/HandlerMapping';
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
import NoHandlerFoundException from '../errors/NoHandlerFoundException';
import ModelAndView from './models/ModelAndView';
import ViewResolverRegistry from './view/ViewResolverRegistry';
import ViewRender from './view/ViewRender';

export default class DispatcherServlet {

  // 所有映射处理器
  private handlerMappings: Array<HandlerMapping>

  private handlerAdapters: Array<HandlerAdapter>

  private exceptionResolver: HandlerExceptionResolverComposite

  private readonly appContext: AbstractApplicationContext

  private viewResolverRegistry: ViewResolverRegistry

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
    this.initViewResolvers();
  }

  private initViewResolvers() {
    this.viewResolverRegistry = this.appContext.getBeanFactory().getBeanOfType(ViewResolverRegistry)[0]
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

  async doDispatch(servletContext: ServletContext): Promise<void> {
    let handler = null;
    const runtime = { error: null, mv: null } as { mv: ModelAndView, error: Error }
    const mappedHandler = this.getHandler(servletContext);
    const request = servletContext.request;
    const response = servletContext.response;
    try {
      if (!mappedHandler) {
        throw new NoHandlerFoundException(servletContext.request);
      }
      // 执行拦截器: preHandler
      const isKeeping = await mappedHandler?.applyPreHandle?.();
      if (!isKeeping) {
        // 如果拦截器中断了本次请求
        return;
      }
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
      const mv = await ha.handle(servletContext, handler);
      // 执行拦截器:postHandler
      await mappedHandler.applyPostHandle(mv);
      runtime.mv = mv;
    } catch (ex) {
      ex = Normalizer.normalizeError(ex);
      runtime.error = ex;
    }
    try {
      if (!response.headersSent && response.hasError) {
        runtime.error = runtime.error || new HttpStatusError(response.status, request.path);
      }
      // 处理结果
      await this.processDispatchResult(runtime.error, runtime.mv, servletContext, handler);
    } finally {
      process.nextTick(() => {
        // 执行拦截器: afterCompletion
        mappedHandler?.applyAfterCompletion?.(runtime.error);
      });
    }
  }

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} servletContext 请求上下文
   */
  async handleException(error: Error, servletContext: ServletContext, handler: HandlerMethod) {
    const mv = await this.exceptionResolver.resolveException(servletContext, handler, error);
    if (!mv) {
      // 如果异常处理器没有解决异常，则直接抛出原始错误
      throw error;
    }
    return mv.isEmpty() ? null : mv;
  }

  async processDispatchResult(error: Error, mv: ModelAndView, servletContext: ServletContext, handler: HandlerMethod) {
    if (error) {
      // 处理异常
      mv = await this.handleException(error, servletContext, handler);
    }
    if (mv) {
      await new ViewRender(this.viewResolverRegistry).render(mv,servletContext);
    }
  }
}