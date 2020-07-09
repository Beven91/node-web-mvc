/**
 * @module ApiImplicitParams
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiImplicitParamOptions } from '../openapi/declare';
import MultipartFile from '../../servlets/http/MultipartFile';

/**
 * 用于标注指定controller为接口类
 * @param {ApiOptions} options 
 */
export default function ApiImplicitParams(params: Array<ApiImplicitParamOptions>) {
  return (target, name, descriptor) => {
    params = params.map((param) => {
      if (typeof param === 'function') {
        const fun = param as Function;
        const options = fun(target, name, descriptor);
        if (!options) {
          return null;
        }
        let dataType = options.dataType || { name: undefined };
        if (dataType === MultipartFile) {
          dataType = { name: 'file' }
        }
        return {
          name: options.value,
          value: options.desc,
          required: options.required,
          paramType: options.paramType,
          dataType: dataType.name,
        }
      }
      return param;
    })
    OpenApi.addOperationParams(params, target.constructor, name);
  }
}