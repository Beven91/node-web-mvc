
/**
 * @module RequestParam
 * @description 提取query请求参数值
 */
import createParam from './createParam';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';

@Target
class RequestParam {

  public param: MethodParameter

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
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