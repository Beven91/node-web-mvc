/**
 * @module ParameterRequiredError
 * @description 一个错误类型，用于表示当前参数没有传递
 */

import ServletContext from "../servlets/http/ServletContext";

export default class ParameterRequiredError extends Error {
  constructor(parameter: string, servletContext: ServletContext) {
    const handler = servletContext.chain.getHandler();
    super(`Required request parameter: ${parameter} is missing @${handler.beanTypeName}.${handler.methodName}`)
  }
}