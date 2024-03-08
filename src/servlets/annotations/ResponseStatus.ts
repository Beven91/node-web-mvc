
/**
 * @module ResponseStatus
 * @description 标注指定action的返回状态与信息
 */

import Target from "./Target";
import ElementType from "./annotation/ElementType";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";

class ResponseStatus {

  /**
  * 返回状态编码
  */
  code: number

  /**
   * 返回状态消息
   */
  reason: string

  constructor(meta: RuntimeAnnotation, options: ResponseStatus) {
    options = options || {} as ResponseStatus;
    this.code = 'code' in options ? options.code : 200;
    this.reason = options.reason || '';
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target(ElementType.METHOD)(ResponseStatus);