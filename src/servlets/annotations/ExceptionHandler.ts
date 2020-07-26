/**
 * @module ExceptionHandler
 * @description 异常处理注解
 */
import ControllerManagement from '../../ControllerManagement';

export default function ExceptionHandler(target, name?, descriptor?) {
  const controllerDescriptor = ControllerManagement.getControllerDescriptor(target.constructor);
  controllerDescriptor.exceptionHandler = descriptor.value;
}