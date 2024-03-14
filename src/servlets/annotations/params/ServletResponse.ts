
/**
 * @module ServletRsponse
 * @description 从请求上下文中提取 response对象
 */
import Target from '../Target';
import ElementType from '../annotation/ElementType';

class ServletRsponse {
}

/**
 * 从servlet上下文中提取response
 * action(@ServletRequest response)
 */
export default Target(ElementType.PARAMETER)(ServletRsponse);