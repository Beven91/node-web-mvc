
/**
 * @module ServletRequest
 * @description 从请求中提取 request对象
 */
import createParam from './createParam';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';

@Target
class ServletRequest {
  constructor(meta: RuntimeAnnotation) {
    createParam('', meta, 'request');
  }
}

/**
 * 从servlet上下文中提取request
 *
 * action(@ServletRequest request)
 * 
 */
export default Target.install<typeof ServletRequest,null>(ServletRequest);