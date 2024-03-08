
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class PathVariable extends ParamAnnotation {

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
    super();
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
export default Target(ElementType.PARAMETER)(PathVariable);