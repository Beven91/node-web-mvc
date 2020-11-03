
/**
 * @module RequestParam
 * @description 提取query请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ParamAnnotation from './ParamAnnotation';

@Target
class RequestParam extends ParamAnnotation {

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
    super();
    this.param = createParam(options, meta, 'query');
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
export default Target.install<typeof RequestParam, MethodParameterOptions | string>(RequestParam);