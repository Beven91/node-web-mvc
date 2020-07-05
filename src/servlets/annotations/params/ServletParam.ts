
/**
 * @module ServletParam
 * @description 提取path中请求参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter from '../../../interface/MethodParameter';

/**
 * 从servlet上下文中提取request 与response 等参数
 */
export default function ServletParam(name: string, type?: 'request' | 'response' | 'next') {
  const value = { value: name, paramType: type || name, required: true };
  return (target, name) => {
    const action = ControllerManagement.getActionDescriptor(target.constructor, name);
    const param = new MethodParameter(value, value.paramType, ServletParam);
    action.params.push(param);
  }
}