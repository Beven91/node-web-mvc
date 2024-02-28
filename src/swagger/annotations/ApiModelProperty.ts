/**
 * @module ApiModelProperty
 * 用于标注实体类下的指定属性
 */
import OpenApi from '../openapi/index';
import { ApiModelPropertyOptions } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';

@Target
class ApiModelProperty {

  constructor(meta: RuntimeAnnotation, options: ApiModelPropertyOptions) {
    options = options || {} as ApiModelPropertyOptions;
    options.dataType = options.dataType || meta.dataType;
    OpenApi.addModelProperty(options, meta.ctor, meta.name);
  }
}

/**
 * 用于标注实体类下的指定属性
 * @param {ApiOperationOptions} options 属性配置 
 */
export default Target.install<typeof ApiModelProperty>(ApiModelProperty);