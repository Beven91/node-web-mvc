/**
 * @module RequestBody
 * @description 提取body请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ParamAnnotation from './ParamAnnotation';
import ElementType from '../annotation/ElementType';

class RequestBody extends ParamAnnotation {

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string ) {
    super();
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
export default Target(ElementType.PARAMETER)(RequestBody);