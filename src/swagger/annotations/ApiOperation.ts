/**
 * @module ApiOperation
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiOperationOptions } from '../openapi/declare';

/**
 * 用于标注接口类下的接口方法
 * @param {ApiOperationOptions} operation 接口方法配置 
 */
export default function ApiOperation(operation: ApiOperationOptions) {
  return (target, name, descriptor) => {
    OpenApi.addOperation(operation, target.constructor, name);
  }
}