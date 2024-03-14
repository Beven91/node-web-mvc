/**
 * @module ControllerAdvice
 * @description 
 *    标注指定类，用于使用该类执行以下处理:
 */
import Target from "./Target";
import ElementType from "./annotation/ElementType";

export class ControllerAdvice {

}

/**
 * 注册Controller切面
 */
export default Target(ElementType.TYPE)(ControllerAdvice);