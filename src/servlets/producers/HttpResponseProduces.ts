/**
 * @module ControllerActionProduces
 * @description 用于处理控制器返回的结果
 */
import ServletContext from '../http/ServletContext';
import ControllerManagement from '../../ControllerManagement';
import { ActionDescriptors } from '../../interface/declare';
import ServletModel from '../models/ServletModel';
import RouteMapping from '../../routes/RouteMapping';
import HandlerMethod from '../method/HandlerMethod';
import MessageConverter from '../http/converts/MessageConverter';
import MediaType from '../http/MediaType';
import ModelAndView from '../models/ModelAndView';
import ViewResolverRegistry from '../view/ViewResolverRegistry';
import View from '../view/View';
import ViewNotFoundError from '../../errors/ViewNotFoundError';

export default class HttpResponseProduces {

  private servletContext: ServletContext = null

  private actionMapping: RouteMapping = null

  constructor(servletContext: ServletContext) {
    const actionName = servletContext.actionName;
    const Controller = servletContext.Controller;
    const descriptor = ControllerManagement.getControllerDescriptor(Controller);
    const actions = descriptor.actions;
    const action = (actions[actionName] || {}) as ActionDescriptors;
    this.servletContext = servletContext;
    this.actionMapping = (action.mapping || {}) as RouteMapping;
  }

  /**
   * 生产返回结果
   * @param {any} model 控制器动作返回的结果
   */
  produce(model: ServletModel, handler: HandlerMethod) {
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
    const { actionMapping, servletContext } = this;
    const { produces } = actionMapping;
    // 设置返回内容类型
    if (produces) {
      this.servletContext.response.setHeader('Content-Type', produces);
    }
    // 设置返回状态
    this.servletContext.response.setStatus(status, responseStatusReason);
    // 根据对应的转换器来写出内容到客户端
    return MessageConverter
      .write(data, new MediaType(produces), servletContext)
      .then(() => servletContext.response.end())
      .then(() => data);
  }

  /**
   * 搜索视图
   */
  private resolveViewName(mv: ModelAndView): View {
    const { servletContext: { request } } = this;
    const viewResolvers = ViewResolverRegistry.viewResolvers;
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