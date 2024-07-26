
/**
 * @module ResponseBody
 * @description 标注返回内容类型为body
 */

import Target from './Target';
import ElementType from './annotation/ElementType';

class ResponseBody {

}

/**
 * 标注当前返回ResponseBody结果
 */
export default Target([ ElementType.TYPE, ElementType.METHOD ])(ResponseBody);
