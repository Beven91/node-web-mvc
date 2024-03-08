
/**
 * @module RestController
 * @description 标注指定类为一个rest 风格的controller
 */

import Target from "./Target";
import ElementType from "./annotation/ElementType";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";

class RestController {

  static isRestController(beanType: Function) {
    const annotation = RuntimeAnnotation.getClassAnnotation(beanType, RestController);
    return !!annotation;
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target(ElementType.TYPE)(RestController);