
/**
 * @module RequestHeader
 * @description 提取header中的信息作为参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter,{ MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 提取header中的信息作为参数值
 * 在执行接口函数时作为实参传入。
 */
export default function RequestHeader(value: MethodParameterOptions | string) {
  return (target, name): MethodParameter => {
    const action = ControllerManagement.getActionDescriptor(target.constructor, name);
    const param = new MethodParameter(value, 'header', RequestHeader);
    action.params.push(param);
    return param;
  }
}