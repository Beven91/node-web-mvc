
/**
 * @module ServletRequest
 * @description 从请求中提取 request对象
 */
import createParam from './createParam';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import MethodParameter from '../../../interface/MethodParameter';

@Target
class ServletRequest {

  public param: MethodParameter

  constructor(meta: RuntimeAnnotation) {
    this.param = createParam({ required: true }, meta, 'request');
  }
}

/**
 * 从servlet上下文中提取request
 *
 * action(@ServletRequest request)
 * 
 */
export default Target.install<typeof ServletRequest>(ServletRequest);