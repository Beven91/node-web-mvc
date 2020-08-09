
/**
 * @module RestController
 * @description 标注指定类为一个rest 风格的controller
 */

import Target from "./Target";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";
import ControllerManagement from "../../ControllerManagement";

@Target
class RestController {

  constructor(meta: RuntimeAnnotation) {
    const descriptor = ControllerManagement.getControllerDescriptor(meta.ctor);
    descriptor.produces = 'application/json;charset=utf-8';
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target.install<typeof RestController,string>(RestController);