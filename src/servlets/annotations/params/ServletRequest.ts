
/**
 * @module ServletRequest
 * @description 从请求中提取 request对象
 */
import Target from '../Target';
import ElementType from '../annotation/ElementType';

class ServletRequest {

}

/**
 * 从servlet上下文中提取request
 *
 * action(@ServletRequest request)
 *
 */
export default Target(ElementType.PARAMETER)(ServletRequest);
