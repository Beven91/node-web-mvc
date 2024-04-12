/**
 * @module ControllerAdvice
 * @description 
 *    标注指定类，用于使用该类执行以下处理:
 */
import Component from "../../ioc/annotations/Component";
import Merge from "./Merge";
import Target from "./Target";
import ElementType from "./annotation/ElementType";

@Merge(
  Component
)
export class ControllerAdvice {

}

/**
 * 注册Controller切面
 */
export default Target(ElementType.TYPE)(ControllerAdvice);