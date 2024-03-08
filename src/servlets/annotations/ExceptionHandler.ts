/**
 * @module ExceptionHandler
 * @description 异常处理注解
 */
import Target from "./Target";
import ElementType from "./annotation/ElementType";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";

class ExceptionHandler {

  handleException: Function

  constructor(meta: RuntimeAnnotation) {
    this.handleException = meta.method;
  }
}

/**
 * 标注指定类为一个rest 异常处理函数
 */
export default Target(ElementType.METHOD)(ExceptionHandler);