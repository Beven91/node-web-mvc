/**
 * @module RequestBody
 * @description 提取body请求参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 从query请求参数中，提取指定名称的参数值
 * 在执行接口函数时作为实参传入。
 */
export default function RequestBody(value: MethodParameterOptions | string) {
  return (target, name): MethodParameter => {
    const action = ControllerManagement.getActionDescriptor(target.constructor, name);
    const param = new MethodParameter(value, 'body', RequestBody);
    action.params.push(param);
    return param;
  }
}