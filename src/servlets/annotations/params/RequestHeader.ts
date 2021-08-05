
/**
 * @module RequestHeader
 * @description 提取header中的信息作为参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ParamAnnotation from './ParamAnnotation';

@Target
class RequestHeader extends ParamAnnotation {

  constructor(meta: RuntimeAnnotation, options: MethodParameterOptions | string) {
    super();
    this.param = createParam(options, meta, 'header');
  }
}

/**
 * 提取header中的信息作为参数值
 *  
 *  action(@RequestHeader({ value:'accept' }) id)
 * 
 */
export default Target.install<typeof RequestHeader>(RequestHeader);