/**
 * @module ControllerActionProduces
 * @description 用于处理控制器返回的结果
 */
import ServletContext from '../ServletContext';
import ControllerManagement from '../../ControllerManagement';
import { ActionDescriptors } from '../../interface/declare';
import ServletModel from '../../models/ServletModel';
import RouteMapping from '../../routes/RouteMapping';
import HandlerMethod from '../method/HandlerMethod';
import MessageConverter from '../converts/MessageConverter';
import MediaType from '../MediaType';

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
    const { responseStatus } = handler;
    const { actionMapping, servletContext } = this;
    const { produces } = actionMapping;
    const useStatus = !(responseStatus === null || responseStatus === undefined)
    const status = useStatus ? responseStatus : 200;
    // 设置返回内容类型
    if (produces) {
      this.servletContext.response.setHeader('Content-Type', produces);
    }
    // 设置返回状态
    this.servletContext.response.writeHead(status);
    // 根据对应的转换器来写出内容到客户端
    return MessageConverter
      .write(data, new MediaType(produces), servletContext)
      .then(() => servletContext.response.end())
  }
}