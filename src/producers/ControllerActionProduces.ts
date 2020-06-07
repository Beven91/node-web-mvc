/**
 * @module ControllerActionProduces
 * @description 用于处理控制器返回的结果
 */
import ServletContext from '../servlets/ServletContext';
import ControllerManagement from '../ControllerManagement';
import ServletModel from '../models/ServletModel';

export default class ControllerActionProduces {

  private servletContext: ServletContext = null

  private actionMapping = null

  constructor(servletContext: ServletContext) {
    const actionName = servletContext.actionName;
    const Controller = servletContext.controllerClass;
    const attributes = ControllerManagement.getControllerAttributes(Controller) || {};
    const actions = attributes.actions || {};
    this.servletContext = servletContext;
    this.actionMapping = actions[actionName] || {};
  }

  /**
   * 生产返回结果
   * @param {any} model 控制器动作返回的结果
   */
  produce(model: ServletModel) {
    return Promise
      .resolve(model.data)
      .then((data) => this.handleProduces(data))
      .catch((ex) => this.servletContext.next(ex))
  }

  /**
   * 通过servletContext来处理对应平台下的返回结果
   */
  private handleProduces(data) {
    const { responseStatus } = this.servletContext.handlerMethod;
    const useStatus = !(responseStatus === null || responseStatus === undefined)
    const status = useStatus ? responseStatus : 200;
    return this.servletContext.end(data, status, this.actionMapping.produces)
  }
}