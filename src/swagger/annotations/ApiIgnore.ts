
/**
 * @module ApiIgnore
 * 忽略文档生成
 */

import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class ApiIgnore {
 
}

/**
 * 标注此控制器不生成文档
 */
export default Target(ElementType.TYPE)(ApiIgnore);