/**
 * @module ControllerAdviceAdapter
 * @description 用于执行ControllerAdvice相关
 */
import ServletContext from './servlets/ServletContext';
import ControllerManagement from './ControllerManagement';

export default class ControllerAdviceAdapter {

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} servletContext 请求上下文
   */
  static handleException(error, servletContext: ServletContext): Promise<any> {
    const { controllerClass, controller } = servletContext;
    const advice = ControllerManagement.controllerAdviceInstance;
    const controllerAttributes = ControllerManagement.getControllerAttributes(controllerClass);
    const adviceAttributes = advice ? ControllerManagement.getControllerAttributes(advice.constructor) : null;
    if (error) {
      console.error('Node-Mvc', 'execute Controller error', error)
    }
    if (controllerAttributes.exceptionHandler) {
      // 优先处理：如果存在控制器本身设置的exceptionhandler
      return Promise.resolve({
        called: true,
        result: controllerAttributes.exceptionHandler.call(controller, error)
      });
    } else if (adviceAttributes.exceptionHandler) {
      // 全局异常处理:
      return Promise.resolve({
        called: true,
        result: adviceAttributes.exceptionHandler.call(advice, error),
      });
    } else {
      // 如果没有定义异常处理
      return Promise.reject(error);
    }
  }
}