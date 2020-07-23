/**
 * @module RequestBody
 * @description 提取body请求参数值
 */
import createParam from './createParam';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';

@Target
class RequestBody {
  
  public param: MethodParameter

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
    this.param = createParam(options, meta, 'body');
  }
}

/**
 * 将body提取成指定参数
 * 
 *  action(@RequestBody user)
 * 
 *  action(@RequestBody({ required:true }) user)
 */
export default Target.install<typeof RequestBody, MethodParameterOptions | string>(RequestBody);