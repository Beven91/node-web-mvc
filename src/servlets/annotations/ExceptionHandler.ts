/**
 * @module ExceptionHandler
 * @description 异常处理注解
 */
import Target from "./Target";
import ElementType from "./annotation/ElementType";

class ExceptionHandler {

}

/**
 * 标注指定类为一个rest 异常处理函数
 */
export default Target(ElementType.METHOD)(ExceptionHandler);