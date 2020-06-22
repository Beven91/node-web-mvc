
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import { ActionDescriptors } from '../../../interface/declare';

/**
 * 从请求path中提取指定名称的参数值
 * 在执行接口函数时作为实参传入。
 */
export default function PathVariable(value: MethodParameterOptions | string) {
  return (target, name): MethodParameter => {
    const descriptor = ControllerManagement.getControllerDescriptor(target.constructor);
    const action = descriptor.actions[name] = descriptor.actions[name] || ({} as ActionDescriptors);
    if (!action.params) {
      action.params = [];
    }
    const param = new MethodParameter(value, 'path', PathVariable);
    action.params.push(param);
    return param;
  }
}