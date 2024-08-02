
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import Target from '../Target';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class PathVariable extends ParamAnnotation {
  constructor() {
    super('path');
  }
}

/**
 * 从请求path中提取指定名称的参数值
 *
 *  action(@PathVariable id)
 *
 *  action(@PathVariable({ required: true }) id)
 */
export default Target(ElementType.PARAMETER)(PathVariable);
