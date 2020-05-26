/**
 * @module ControllerAdvice
 * @description 
 *    标注指定类，用于使用该类执行以下处理:
 *    1. 全局处理运行异常
 *    2. 暂不实现 : 全局数据绑定
 */
const ControllerManagement = require('../ControllerManagement');

module.exports = function ControllerAdvice(ControllerAdivce) {
  const instance = new ControllerAdivce();
  ControllerManagement.controllerAdviceInstance = instance;
}