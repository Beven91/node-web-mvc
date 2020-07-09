
/**
 * @module RequestParam
 * @description 提取query请求参数值
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Javascript from '../../../interface/Javascript';

/**
 * 从query请求参数中，提取指定名称的参数值
 * 在执行接口函数时作为实参传入。
 */
export default function RequestParam(...params: Array<any | MethodParameterOptions>): any {
  if (params.length === 1) {
    return (target, name) => createRequestParam(target, name, params[0])
  } else {
    const [target, name, index] = params;
    const handler = target[name];
    const parameters = Javascript.resolveParameters(handler);
    createRequestParam(target, name, { value: parameters[index] });
  }
}

function createRequestParam(target, name, options): MethodParameter {
  const action = ControllerManagement.getActionDescriptor(target.constructor, name);
  const param = new MethodParameter(options, 'query', RequestParam);
  action.params.push(param);
  return param;
}