
/**
 * @module RequestParam
 * @description 提取query请求参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter from '../../../interface/MethodParameter';
import { ActionDescriptors } from '../../../interface/declare';

/**
 * 从query请求参数中，提取指定名称的参数值
 * 在执行接口函数时作为实参传入。
 */
export default function RequestParam(value: MethodParameter | string) {
  return (target, name): MethodParameter => {
    const descriptor = ControllerManagement.getControllerDescriptor(target.constructor);
    const action = descriptor.actions[name] = descriptor.actions[name] || ({} as ActionDescriptors);
    if (!action.params) {
      action.params = [];
    }
    const param = new MethodParameter(value, 'query', RequestParam);
    action.params.push(param);
    return param;
  }
}