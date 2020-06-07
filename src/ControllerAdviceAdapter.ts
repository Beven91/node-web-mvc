/**
 * @module ControllerAdviceAdapter
 * @description 用于执行ControllerAdvice相关
 */
import ServletContext from './servlets/ServletContext';
import ControllerManagement from './ControllerManagement';
import ServletModel from './models/ServletModel';
import InterruptModel from './models/InterruptModel';

export default class ControllerAdviceAdapter {

  /**
   * 处理异常
   * @param { Error } error 异常信息
   * @param {ControllerContext} servletContext 请求上下文
   */
  static handleException(error, servletContext: ServletContext): Promise<ServletModel> {
    const { controllerClass, controller } = servletContext;
    const advice = ControllerManagement.controllerAdviceInstance;
    const controllerAttributes = ControllerManagement.getControllerAttributes(controllerClass);
    const adviceAttributes = advice ? ControllerManagement.getControllerAttributes(advice.constructor) : null;
    if (error) {
      console.error('Node-Mvc', 'execute Controller error:');
      console.error(error.stack || error);
    }
    if (controllerAttributes.exceptionHandler) {
      // 优先处理：如果存在控制器本身设置的exceptionhandler
      const res = controllerAttributes.exceptionHandler.call(controller, error);
      return Promise.resolve(new ServletModel(res));
    } else if (adviceAttributes.exceptionHandler) {
      // 全局异常处理:
      const res = adviceAttributes.exceptionHandler.call(advice, error);
      return Promise.resolve(new ServletModel(res));
    } else {
      // 如果没有定义异常处理
      return Promise.reject(error);
    }
  }
}