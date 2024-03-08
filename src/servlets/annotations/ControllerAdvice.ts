/**
 * @module ControllerAdvice
 * @description 
 *    标注指定类，用于使用该类执行以下处理:
 *    1. 全局处理运行异常
 *    2. 暂不实现 : 全局数据绑定
 */
import Target from "./Target";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";
import AdviceRegistry from '../advice/AdviceRegistry';
import ElementType from "./annotation/ElementType";

export class ControllerAdvice {

  constructor(meta: RuntimeAnnotation) {
    AdviceRegistry.register(meta.target);
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target(ElementType.TYPE)(ControllerAdvice);