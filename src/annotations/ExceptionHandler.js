/**
 * @module ExceptionHandler
 * @description 异常处理注解
 */
const ControllerManagement = require('../ControllerManagement');

module.exports = function () {
  return function ExceptionHandler(target, name, descriptor) {
    const attribute = ControllerManagement.getControllerAttributes(target.constructor);
    attribute.exceptionHandler = descriptor.value;
  }
}