
/**
 * @module RequestHeader
 * @description 提取header中的信息作为参数值
 */
import Target from '../Target';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class RequestHeader extends ParamAnnotation {
  constructor() {
    super('header');
  }
}

/**
 * 提取header中的信息作为参数值
 *
 *  action(@RequestHeader({ value:'accept' }) id)
 *
 */
export default Target(ElementType.PARAMETER)(RequestHeader);
