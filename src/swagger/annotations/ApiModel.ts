/**
 * @module ApiModel
 * 用于标注接实体类
 */

import OpenApi from '../openapi/index';
import { ApiModelOptions } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class ApiModel extends ApiModelOptions {

  constructor(meta: RuntimeAnnotation, options: ApiModelOptions) {
    super();
    options = options || {} as ApiModelOptions;
    OpenApi.addModel(options, meta.ctor);
  }
}

/**
 * 用于标注接实体类
 * @param {ApiOperationOptions} options 配置 
 */
export default Target(ElementType.TYPE)(ApiModel);