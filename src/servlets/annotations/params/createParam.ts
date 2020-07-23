import ControllerManagement from '../../../ControllerManagement';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Javascript from '../../../interface/Javascript';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';

export default function (options: MethodParameterOptions | string, meta: RuntimeAnnotation, type): MethodParameter {
  const isString = typeof options === 'string';
  options = ((isString ? { value: options } : options) || {}) as MethodParameterOptions;
  const { target, paramIndex, name } = meta;
  const handler = target[name];
  const parameters = Javascript.resolveParameters(handler);
  options.name = options.name || parameters[paramIndex];
  options.value = options.value || options.name;
  const action = ControllerManagement.getActionDescriptor(target.constructor, name);
  const param = new MethodParameter(options, type, meta);
  action.params.push(param);
  return param;
}