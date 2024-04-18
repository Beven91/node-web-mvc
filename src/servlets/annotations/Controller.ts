
/**
 * @module Controller
 * @description 标注指定类为一个传统风格的controller
 */

import Component from "../../ioc/annotations/Component";
import Merge from "./Merge";
import Target from "./Target";
import ElementType from "./annotation/ElementType";

@Merge(
  Component
)
class Controller {

}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target(ElementType.TYPE)(Controller);