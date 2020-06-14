/**
 * @module ApiImplicitParams
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiImplicitParamOptions } from '../openapi/declare';

/**
 * 用于标注指定controller为接口类
 * @param {ApiOptions} options 
 */
export default function ApiImplicitParams(params: Array<ApiImplicitParamOptions>) {
  return (target, name, descriptor) => {
    setTimeout(() => {
      OpenApi.addOperationParams(params, target.constructor, name);
    }, 0)
  }
}