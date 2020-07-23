
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import createParam from './createParam';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';

@Target
class PathVariable {

  public param: MethodParameter

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
    this.param = createParam(options, meta, 'path');
  }
}

/**
 * 从请求path中提取指定名称的参数值
 * 
 *  action(@PathVariable id)
 * 
 *  action(@PathVariable({ required: true }) id) 
 */
export default Target.install<typeof PathVariable, MethodParameterOptions | string>(PathVariable);