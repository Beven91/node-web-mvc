/**
 * @module ParameterRequiredError
 * @description 一个错误类型，用于表示当前参数没有传递
 */

import HandlerMethod from "../servlets/method/HandlerMethod";
import Exception from "./Exception";

export default class ParameterRequiredError extends Exception {
  constructor(parameter: string, handler: HandlerMethod) {
    super(`Required request parameter: ${parameter} is missing @${handler.beanTypeName}.${handler.methodName}`)
  }
}