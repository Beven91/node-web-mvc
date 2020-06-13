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
  return (controller, name, descriptor) => {
    // 保证注解执行时，其他注解已执行完毕，这里主要时等待@RequestMapping之类的注解
    process.nextTick(() => {
      OpenApi.addOperation(operation, controller, name);
    });
  }
}