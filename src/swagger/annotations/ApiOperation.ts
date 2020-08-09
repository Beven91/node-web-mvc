/**
 * @module ApiOperation
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiOperationOptions } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';

@Target
class ApiOperation {

  constructor(meta: RuntimeAnnotation, operation: ApiOperationOptions) {
    operation = operation || {};
    operation.returnType = operation.returnType || (meta.returnType ? meta.returnType.name : '');
    OpenApi.addOperation(operation, meta.ctor, meta.name);
  }
}

/**
 * 用于标注接口类下的接口方法
 * @param {ApiOperationOptions} operation 接口方法配置 
 */
export default Target.install<typeof ApiOperation, ApiOperationOptions>(ApiOperation);