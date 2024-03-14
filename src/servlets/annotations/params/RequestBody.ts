/**
 * @module RequestBody
 * @description 提取body请求参数值
 */
import Target from '../Target';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class RequestBody extends ParamAnnotation {

  constructor() {
    super('body');
  }
}

/**
 * 将body提取成指定参数
 * 
 *  action(@RequestBody user)
 * 
 *  action(@RequestBody({ required:true }) user)
 */
export default Target(ElementType.PARAMETER)(RequestBody);