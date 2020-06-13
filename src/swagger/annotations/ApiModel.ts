/**
 * @module ApiModel
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiModelOptions } from '../openapi/declare';

/**
 * 用于标注接实体类
 * @param {ApiModelOptions} options 接口方法配置 
 */
export default function ApiModel(options: ApiModelOptions) {
  return (model) => {
    OpenApi.addModel(options, model);
  }
}