
/**
 * @module RequestHeader
 * @description 提取header中的信息作为参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter from '../../../interface/MethodParameter';
import { ActionDescriptors } from '../../../interface/declare';

/**
 * 提取header中的信息作为参数值
 * 在执行接口函数时作为实参传入。
 */
export default function RequestHeader(value: MethodParameter | string) {
  return (target, name): MethodParameter => {
    const descriptor = ControllerManagement.getControllerDescriptor(target.constructor);
    const action = descriptor.actions[name] = descriptor.actions[name] || ({} as ActionDescriptors);
    if (!action.params) {
      action.params = [];
    }
    const param = new MethodParameter(value,'header');
    action.params.push(param);
    return param;
  }
}