/**
 * @module ControllerActionProduces
 * @description 用于处理控制器返回的结果
 */
const ControllerManagement = require('../ControllerManagement');

class ControllerActionProduces {

  constructor(controllerContext,action) {
    const Controller = controllerContext.controllerClass;
    const attributes = ControllerManagement.getControllerAttributes(Controller);
    this.controllerContext = controllerContext;
    this.actionMapping = attributes.actions[action] || {};
  }

  /**
   * 生产返回结果
   * @param {any} res 控制器动作返回的结果
   * @param {String} action 当前执行的动作名
   */
  produce(res, action) {
    return Promise
      .resolve(res)
      .then((data) => this.handleProduces(data))
      .catch((ex) => this.next(ex))
  }

  handleProduces(data) {
    this.controllerContext.returnResponse(data, this.actionMapping.produces)
  }
}

module.exports = ControllerActionProduces;