/**
 * @module DispatcherServlet
 * @description controller请求执行入口
 */
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import HandlerAdapter from '../method/HandlerAdapter';
import HandlerExecutionChain from '../interceptor/HandlerExecutionChain';
import RequestMappingHandlerAdapter from '../method/RequestMappingHandlerAdapter';
import HttpResponseProduces from '../producers/HttpResponseProduces';
import InterruptModel from '../models/InterruptModel';
import HandlerMapping from '../mapping/HandlerMapping';
import RequestMappingHandlerMapping from '../mapping/RequestMappingHandlerMapping'
import AdviceRegistry from '../advice/AdviceRegistry';
import ExceptionHandler, { ExceptionHandlerAnnotation } from '../annotations/ExceptionHandler';
import Middlewares from '../models/Middlewares';
import ResourceHandlerAdapter from '../resources/ResourceHandlerAdapter';
import ResourceHandlerMapping from '../resources/ResourceHandlerMapping';
import NoRequestHandlerMapping from '../mapping/NoRequestHandlerMapping';

export default class DispatcherServlet {

  // 所有映射处理器
  private handlerMappings: Array<HandlerMapping>

  private handlerAdapters: Array<HandlerAdapter>

  constructor() {
    this.handlerMappings = [
      RequestMappingHandlerMapping.getInstance(),
      ResourceHandlerMapping.getInstance(),
      NoRequestHandlerMapping.getInstance(),
      // RouterFunctionMapping  --> FilteredRouterFunctions
      // AbstractUrlHandlerMapping --> SimpleUrlHandlerMapping
      // AbstractHandlerMethodMapping --> RequestMappingInfoHandlerMapping --> RequestMappingHandlerMapping
      // AbstractDetectingUrlHandlerMapping
    ]

    this.handlerAdapters = [
      new RequestMappingHandlerAdapter(),
      new ResourceHandlerAdapter(),
    ]
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

  async doService(servletContext: ServletContext): Promise<ServletModel> {
    try {
      const model = await this.doDispatch(servletContext);
      if (model instanceof InterruptModel && !servletContext.response.headersSent) {
        // 如果没有执行action,跳转到下一个
        servletContext.next()
      }
    } catch (ex) {
      if (!servletContext.response.headersSent) {
        // 如果出现意外异常
        servletContext.next(ex);
      }
      return Promise.reject(ex);
    } finally {
      servletContext.doReleaseQueues();
    }
  }

  async doDispatch(servletContext: ServletContext): Promise<ServletModel> {
    const runtime = { res: null, error: null }
    const mappedHandler = this.getHandler(servletContext);
    if (!mappedHandler) {
      return new InterruptModel();
    }
    try {
      // 执行拦截器: preHandler
      const isKeeping = await mappedHandler.applyPreHandle();
      if (!isKeeping) {
        // 如果拦截器中断了本次请求
        return new InterruptModel();
      }
      try {
        // 获取handler当前执行适配器
        const ha = this.getHandlerAdapter(mappedHandler.getHandler());
        // 开始执行handler
        const res = await ha.handle(servletContext, mappedHandler.getHandler());
        runtime.res = await this.applyMiddlewares(servletContext, res);
      } catch (ex) {
        // 自定义异常处理
        runtime.res = await this.handleException(ex, servletContext);
      }
      // 执行拦截器:postHandler
      runtime.res = await mappedHandler.applyPostHandle(runtime.res);
      process.nextTick(() => {
        // 执行拦截器: afterCompletion
        mappedHandler.applyAfterCompletion(runtime.error);
      });
      // 处理视图渲染或者数据返回
      return (new HttpResponseProduces(servletContext)).produce(runtime.res, mappedHandler.getHandler());
    } catch (ex) {
      runtime.error = ex;
    }
    return runtime.error ? Promise.reject(runtime.error) : runtime.res;
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
  handleException(error, servletContext: ServletContext): Promise<ServletModel> {
    const globalHandler = AdviceRegistry.getExceptionHandler();
    const chain = servletContext.chain;
    const handlerMethod = chain.getHandler();
    const anno = handlerMethod.getClassAnnotation<ExceptionHandlerAnnotation>(ExceptionHandler);
    console.error(error.stack || error);
    if (anno && anno.handleException) {
      // 优先处理：如果存在控制器本身设置的exceptionhandler
      const res = anno.handleException.call(handlerMethod, error);
      return Promise.resolve(new ServletModel(res));
    } else if (globalHandler) {
      // 全局异常处理:
      const res = globalHandler(error);
      return Promise.resolve(new ServletModel(res));
    } else {
      // 如果没有定义异常处理
      return Promise.reject(error);
    }
  }
}