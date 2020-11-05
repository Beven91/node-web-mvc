/**
 * @module ApiImplicitParams
 * 用于标注接口参数
 */
import { ApiImplicitParamOptions } from '../openapi/declare';
import { parameterReturnable } from '../../servlets/annotations/Target';
import Javascript from '../../interface/Javascript';
import Target from '../../servlets/annotations/Target';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';

@Target
export class ApiImplicitParamsAnnotation {

  parameters?: Array<ApiImplicitParamOptions>

  constructor(meta: RuntimeAnnotation, options: Array<ApiImplicitParamOptions>) {
    const { target, methodName: name } = meta;
    const parameters = Javascript.resolveParameters(target[name]);
    this.parameters = options.map((param) => {
      if (typeof param === 'function') {
        const decorator = param as Function;
        // 执行参数注解
        const annotation = decorator(parameterReturnable, (options) => {
          const data = options[0] as ApiImplicitParamOptions;
          const paramName = typeof data === 'string' ? data : data.value;
          const paramIndex = parameters.indexOf(paramName);
          return [target, name, paramIndex];
        });
        const options = annotation ? annotation.nativeAnnotation.param : null;
        if (!annotation || !options) {
          return null;
        }
        return {
          name: options.value,
          description: options.desc,
          required: options.required,
          paramType: options.paramType,
          example: options.example,
          dataType: options.dataType,
        }
      }
      return param;
    })
  }
}

/**
 * 用于标注接实体类
 * @param {ApiOperationOptions} options 配置 
 */
export default Target.install<typeof ApiImplicitParamsAnnotation, Array<ApiImplicitParamOptions>>(ApiImplicitParamsAnnotation);