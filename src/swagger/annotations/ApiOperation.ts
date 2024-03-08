/**
 * @module ApiOperation
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiOperationOptions } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class ApiOperation extends ApiOperationOptions {

  constructor(meta: RuntimeAnnotation, operation: ApiOperationOptions) {
    super();
    operation = operation || {};
    operation.returnType = operation.returnType || (meta.returnType ? meta.returnType.name : '');
    OpenApi.addOperation(operation, meta.ctor, meta.name);
  }
}

/**
 * 用于标注接口类下的接口方法
 * @param {ApiOperationOptions} operation 接口方法配置 
 */
export default Target([ElementType.TYPE, ElementType.METHOD])(ApiOperation);