
/**
 * @module RequestPart
 * @description 提取query请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class RequestPart extends ParamAnnotation {

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
    super();
    this.param = createParam(options, meta, 'part');
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