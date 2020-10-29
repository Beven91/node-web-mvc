/**
 * @module ControllerActionProduces
 * @description 用于处理控制器返回的结果
 */
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import RequestMappingInfo from '../mapping/RequestMappingInfo';
import HandlerMethod from '../method/HandlerMethod';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import MediaType from '../http/MediaType';
import ModelAndView from '../models/ModelAndView';
import View from '../view/View';
import ViewNotFoundError from '../../errors/ViewNotFoundError';
import InterruptModel from '../models/InterruptModel';
import { RequestMappingAnnotation } from '../annotations/mapping/RequestMapping';
import { RestControllerAnnotation } from '../annotations/RestController';

export default class HttpResponseProduces {

  private servletContext: ServletContext = null

  private controllerMapping: RequestMappingInfo

  private actionMapping: RequestMappingInfo

  constructor(servletContext: ServletContext) {
    this.servletContext = servletContext;
    const handlerMethod = servletContext.chain.getHandler();
    this.controllerMapping = RequestMappingAnnotation.getMappingInfo(handlerMethod.beanType);
    this.actionMapping = RequestMappingAnnotation.getMappingInfo(handlerMethod.beanType, handlerMethod.methodName);
  }

  /**
   * 生产返回结果
   * @param {any} model 控制器动作返回的结果
   */
  produce(model: ServletModel, handler: HandlerMethod) {
    if (model instanceof InterruptModel) {
      return model.isEnd ? null : this.servletContext.next();
    }
    return Promise
      .resolve(model.data)
      .then((data) => this.handleProduces(data, handler))
      .catch((ex) => this.servletContext.next(ex))
  }

  /**
   * 通过servletContext来处理对应平台下的返回结果
   */
  private handleProduces(data, handler: HandlerMethod) {
    if (data instanceof ModelAndView) {
      return this.handleViewResponse(data);
    } else {
      return this.handleModelResponse(data, handler);
    }
  }

  /**
   * 返回视图类型内容
   * @param data 
   */
  private handleViewResponse(mv: ModelAndView) {
    const { servletContext: { request, response } } = this;
    if (response.headersSent) {
      // 如果前置流程已处理了返回
      return;
    }
    return Promise
      // 查找视图
      .resolve(this.resolveViewName(mv))
      // 渲染视图
      .then((view) => view.render(mv.model, request, response))
      // 异常处理
      .catch((error) => {
        response.setStatus(500, error.message).end();
      })
  }

  /**
   * 返回非视图数据
   */
  private handleModelResponse(data, handler: HandlerMethod) {
    const { responseStatus, responseStatusReason } = handler;
    const useStatus = !(responseStatus === null || responseStatus === undefined)
    const status = useStatus ? responseStatus : 200;
    const { servletContext } = this;
    const { response } = servletContext;
    const isRestController = RestControllerAnnotation.isRestController(handler.beanType);
    const restProduces = isRestController ? 'application/json;charset=utf-8' : '';
    const ctrlProduces = this.controllerMapping ? this.controllerMapping.produces : '';
    const actProduces = this.actionMapping ? this.actionMapping.produces : '';
    const produces = actProduces || restProduces || ctrlProduces;
    const mediaType = new MediaType(produces || response.nativeContentType || 'text/plain;charset=utf-8');
    // 设置返回内容类型
    response.setHeader('Content-Type', mediaType.toString());
    // 设置返回状态
    response.setStatus(status, responseStatusReason);
    // 根据对应的转换器来写出内容到客户端
    return WebMvcConfigurationSupport
      .configurer
      .messageConverters
      .write(data, mediaType, servletContext)
      .then(() => {
        servletContext.response.end()
      })
      .then(() => data)
      // 异常处理
      .catch((error) => {
        console.error(error);
        response.setStatus(500, error.message).write(error.message || '');
        response.end();
      })
  }

  /**
   * 搜索视图
   */
  private resolveViewName(mv: ModelAndView): View {
    const { servletContext: { request } } = this;
    const viewResolvers = WebMvcConfigurationSupport.configurer.viewResolvers.viewResolvers;
    for (let resolver of viewResolvers) {
      const view = resolver.resolveViewName(mv.view, mv.model, request);
      if (view) {
        return view;
      }
    }
    // 如果没有查到视图，则抛出异常
    throw new ViewNotFoundError(mv.view);
  }
}