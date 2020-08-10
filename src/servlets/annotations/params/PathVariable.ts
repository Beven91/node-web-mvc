
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import createParam, { RequestParameterAnnotation } from './createParam';
import MethodParameter, { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import AnnotaionOptions from '../annotation/AnnotationOptions';

@Target
class PathVariable extends RuntimeAnnotation implements RequestParameterAnnotation {

  public param: MethodParameter

  constructor(meta: AnnotaionOptions, options: MethodParameterOptions | string) {
    super(meta);
    this.param = createParam(options, this, 'path');
  }
}

/**
 * 从请求path中提取指定名称的参数值
 * 
 *  action(@PathVariable id)
 * 
 *  action(@PathVariable({ required: true }) id) 
 */
export default Target.install<typeof PathVariable,MethodParameterOptions | string>(PathVariable);