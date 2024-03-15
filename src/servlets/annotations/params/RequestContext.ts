
/**
 * @module RequestContext
 * @description 注解：用于标注提取context
 */
import Target from '../Target';
import ElementType from '../annotation/ElementType';

class RequestContext {
}

/**
 * 提取servelt上下文
 */
export default Target(ElementType.PARAMETER)(RequestContext);