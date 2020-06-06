/**
 * @module ExceptionHandler
 * @description 异常处理注解
 */
import ControllerManagement from '../ControllerManagement';

export default function () {
  return function ExceptionHandler(target, name?, descriptor?) {
    const attribute = ControllerManagement.getControllerAttributes(target.constructor);
    attribute.exceptionHandler = descriptor.value;
  }
}