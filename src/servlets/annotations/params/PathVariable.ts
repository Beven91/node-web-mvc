
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 从请求path中提取指定名称的参数值
 * 在执行接口函数时作为实参传入。
 */
export default function PathVariable(value: MethodParameterOptions | string) {
  return (target, name): MethodParameter => {
    const action = ControllerManagement.getActionDescriptor(target.constructor, name);
    const param = new MethodParameter(value, 'path', PathVariable);
    action.params.push(param);
    return param;
  }
}