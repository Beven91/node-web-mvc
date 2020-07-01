/**
 * @module DispatcherServlet
 * @description controller请求执行入口
 */
import ServletContext from './http/ServletContext';
import ServletModel from './models/ServletModel';
import HandlerAdapter from './method/HandlerAdapter';
import HandlerExecutionChain from './interceptor/HandlerExecutionChain';
import RequestMappingHandlerAdapter from './method/RequestMappingHandlerAdapter';
import HttpResponseProduces from './producers/HttpResponseProduces';
import InterruptModel from './models/InterruptModel';
import ControllerManagement from '../ControllerManagement';

export default class DispatcherServlet {

  getHandler(servletContext: ServletContext): HandlerExecutionChain {
    return new HandlerExecutionChain(servletContext)
  }

  /**
   * 根据当前处理的handler获取对应的处理适配器
   * @param handler 
   */
  getHandlerAdapter(handler): HandlerAdapter {
    //TODO: 这先临时固定为 RequestMappingHandlerAdapter,待后续完善
    return new RequestMappingHandlerAdapter();
  }

  async doService(servletContext: ServletContext): Promise<ServletModel> {
    try {
      return this.doDispatch(servletContext);
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async doDispatch(servletContext: ServletContext): Promise<ServletModel> {
    const runtime = { res: null, error: null }
    const mappedHandler = this.getHandler(servletContext);
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
        runtime.res = await ha.handle(servletContext, mappedHandler.getHandler());
      } catch (ex) {
        // 自定义异常处理
        runtime.res = await this.handleException(ex, servletContext);
      }
      // 执行拦截器:postHandler
      runtime.res = await mappedHandler.applyPostHandle(runtime.res);
      // 处理视图渲染或者数据返回
      return (new HttpResponseProduces(servletContext)).produce(runtime.res, mappedHandler.getHandler());
    } catch (ex) {
      runtime.error = ex;
    }
    process.nextTick(() => {
      // 执行拦截器: afterCompletion
      mappedHandler.applyAfterCompletion(runtime.error);
    });
    return runtime.error ? Promise.reject(runtime.error) : runtime.res;
  }

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} servletContext 请求上下文
   */
  handleException(error, servletContext: ServletContext): Promise<ServletModel> {
    const { Controller, controller } = servletContext;
    const advice = ControllerManagement.controllerAdviceInstance;
    const controllerDescriptors = ControllerManagement.getControllerDescriptor(Controller);
    const adviceDescriptors = advice ? ControllerManagement.getControllerDescriptor(advice.constructor) : null;
    if (controllerDescriptors.exceptionHandler) {
      // 优先处理：如果存在控制器本身设置的exceptionhandler
      const res = controllerDescriptors.exceptionHandler.call(controller, error);
      return Promise.resolve(new ServletModel(res));
    } else if (adviceDescriptors && adviceDescriptors.exceptionHandler) {
      // 全局异常处理:
      const res = adviceDescriptors.exceptionHandler.call(advice, error);
      return Promise.resolve(new ServletModel(res));
    } else {
      // 如果没有定义异常处理
      return Promise.reject(error);
    }
  }
}