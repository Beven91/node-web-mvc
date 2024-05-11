
/**
 * @module RequestParam
 * @description 提取query请求参数值
 */
import Target from '../Target';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class RequestParam extends ParamAnnotation {

  file?: boolean

  constructor() {
    super('query');
  }
}

/**
 * 从query请求参数中，提取指定名称的参数值
 * 
 *  action(@RequestParam id)
 * 
 *  action(@RequestParam({ required: true }) id)
 * 
 */
export default Target(ElementType.PARAMETER)(RequestParam);