/**
 * @module ControllerActionProduces
 * @description 用于处理控制器返回的结果
 */
import ServletContext from '../servlets/ServletContext';
import ControllerManagement from '../ControllerManagement';

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
   * @param {any} res 控制器动作返回的结果
   */
  produce(res) {
    return Promise
      .resolve(res)
      .then((data) => this.handleProduces(data))
      .catch((ex) => this.servletContext.next(ex))
  }

  /**
   * 通过servletContext来处理对应平台下的返回结果
   */
  private handleProduces(data) {
    this.servletContext.end(data, this.actionMapping.produces)
  }
}