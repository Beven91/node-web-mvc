import ControllerManagement from '../../../ControllerManagement';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Javascript from '../../../interface/Javascript';

export default function (target: any, name: string, options: MethodParameterOptions, index: number, type, ctor): MethodParameter {
  const handler = target[name];
  const parameters = Javascript.resolveParameters(handler);
  options.name = options.name || parameters[index];
  options.value = options.value || options.name;
  const action = ControllerManagement.getActionDescriptor(target.constructor, name);
  const param = new MethodParameter(options, type, ctor);
  action.params.push(param);
  return param;
}