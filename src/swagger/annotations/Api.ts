/**
 * @module Api
 * @description swagger的Api注解 用于标注controller接口类
 */
import OpenApi from '../openapi/index';
import { ApiOptions } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class Api {

  constructor(meta: RuntimeAnnotation, options: ApiOptions) {
    options = options || {} as ApiOptions;
    OpenApi.addApi(options, meta.ctor);
  }
}

/**
 * 用于标注接实体类
 * @param {ApiOperationOptions} options 配置 
 */
export default Target(ElementType.TYPE)(Api);