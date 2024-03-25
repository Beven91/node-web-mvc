
/**
 * @module RequestPart
 * @description 提取query请求参数值
 */
import Target from '../Target';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class RequestPart extends ParamAnnotation {

  constructor() {
    super('query');
  }
}

/**
 * 从multipart-data请求参数中，提取指定名称的参数值
 * 
 *  action(@RequestPart id)
 * 
 *  action(@RequestPart({ required: true }) id)
 * 
 */
export default Target(ElementType.PARAMETER)(RequestPart);