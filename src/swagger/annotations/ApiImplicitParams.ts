/**
 * @module ApiImplicitParams
 * 用于标注接口参数
 */
import { ApiImplicitParamOptions } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';


class ApiImplicitParams {

  get parameters(){
    return this.value;
  }

  value: ApiImplicitParamOptions[]
}

/**
 * 用于标注接实体类
 */
export default Target(ElementType.METHOD)(ApiImplicitParams);