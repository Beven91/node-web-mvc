
/**
 * @module RestController
 * @description 标注指定类为一个rest 风格的controller
 */

import Target from "./Target";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";

@Target
export class RestControllerAnnotation {

  constructor(meta: RuntimeAnnotation) {
  }

  static isRestController(beanType: Function) {
    const annotation = RuntimeAnnotation.getClassAnnotation(beanType, RestControllerAnnotation);
    return !!annotation;
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target.install<typeof RestControllerAnnotation>(RestControllerAnnotation);