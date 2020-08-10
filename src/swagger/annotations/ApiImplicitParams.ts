/**
 * @module ApiImplicitParams
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiImplicitParamOptions } from '../openapi/declare';
import MultipartFile from '../../servlets/http/MultipartFile';
import { parameterReturnable, ReturnableAnnotationFunction } from '../../servlets/annotations/Target';
import Javascript from '../../interface/Javascript';
import { RequestParameterAnnotation } from '../../servlets/annotations/params/createParam';

/**
 * 用于标注指定controller为接口类
 * @param {ApiOptions} options 
 */
export default function ApiImplicitParams(params: Array<ApiImplicitParamOptions>) {
  return (target, name, descriptor) => {
    const parameters = Javascript.resolveParameters(target[name]);
    params = params.map((param) => {
      if (typeof param === 'function') {
        const decorator = param as ReturnableAnnotationFunction<RequestParameterAnnotation>
        // 执行参数注解
        const annotation = decorator(parameterReturnable, (options) => {
          const data = options[0] as ApiImplicitParamOptions;
          const paramIndex = parameters.indexOf(data.description);
          return [target, name, paramIndex];
        });
        const options = annotation ? annotation.param : null;
        if (!annotation || !options) {
          return null;
        }
        let dataType = options.dataType || { name: undefined };
        if (dataType === MultipartFile) {
          dataType = { name: 'file' }
        }
        return {
          name: options.value,
          description: options.desc,
          required: options.required,
          paramType: options.paramType,
          dataType: dataType.name === 'Object' ? undefined : dataType.name,
        }
      }
      return param as any;
    })
    OpenApi.addOperationParams(params, target.constructor, name);
  }
}