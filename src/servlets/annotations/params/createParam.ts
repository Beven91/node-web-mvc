import MethodParameter, { MethodParameterOptions, RequestParamType } from '../../../interface/MethodParameter';
import Javascript from '../../../interface/Javascript';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';

export default function (options: MethodParameterOptions | string, meta: RuntimeAnnotation, type: RequestParamType): MethodParameter {
  const isString = typeof options === 'string';
  options = ((isString ? { value: options } : options) || {}) as MethodParameterOptions;
  const { paramIndex } = meta;
  const handler = meta.method
  const parameters = Javascript.resolveParameters(handler);
  options.name = options.name || parameters[paramIndex];
  options.value = options.value || options.name;
  options.dataType = options.dataType || meta.paramType;
  const param = new MethodParameter(options, type, meta);
  return param;
}

