/**
 * @module ApiImplicitParams
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import MethodParameter from '../../interface/MethodParameter';
import { ApiImplicitParamOptions } from '../openapi/declare';

declare function RequestAnnotation(target, name, descriptor): MethodParameter

/**
 * 用于标注指定controller为接口类
 * @param {ApiOptions} options 
 */
export default function ApiImplicitParams(params: Array<ApiImplicitParamOptions | typeof RequestAnnotation>) {
  return (target, name, descriptor) => {
    params = params.map((param) => {
      if (typeof param === 'function') {
        const options = param(target, name, descriptor);
        return {
          name: options.value,
          value: options.desc,
          required: options.required,
          paramType: options.paramType,
          dataType: options.dataType ? options.dataType.name : undefined,
        }
      }
      return param;
    })
    setTimeout(() => {
      OpenApi.addOperationParams(params, target.constructor, name);
    }, 0)
  }
}