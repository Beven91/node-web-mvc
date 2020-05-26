/**
 * @module ControllerAdviceAdapter
 * @description 用于执行ControllerAdvice相关
 */
const ControllerManagement = require('./ControllerManagement');

class ControllerAdviceAdapter {

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} controllerContext 控制器上下文
   */
  static handleException(error, controllerContext) {
    const { controllerClass, controller } = controllerContext;
    const advice = ControllerManagement.controllerAdviceInstance;
    const controllerAttributes = ControllerManagement.getControllerAttributes(controllerClass);
    const adviceAttributes = advice ? ControllerManagement.getControllerAttributes(advice.constructor) : null;
    if (controllerAttributes.exceptionHandler) {
      // 优先处理：如果存在控制器本身设置的exceptionhandler
      return {
        called: true,
        result: controllerAttributes.exceptionHandler.call(controller, error)
      };
    } else if (adviceAttributes.exceptionHandler) {
      // 全局异常处理:
      return {
        called: true,
        result: adviceAttributes.exceptionHandler.call(advice, error),
      }
    } else {
      // 如果没有定义异常处理
      return Promise.reject(error);
    }
  }
}

module.exports = ControllerAdviceAdapter;