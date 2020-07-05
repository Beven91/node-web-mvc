/**
 * @module ParameterRequiredError
 * @description 一个错误类型，用于表示当前参数没有传递
 */

import MethodParameter from "../interface/MethodParameter";
import ServletContext from "../servlets/http/ServletContext";

export default class ParameterRequiredError extends Error {
  constructor(parameter:string, servletContext: ServletContext) {
    super(`Required request parameter: ${parameter} is missing @${servletContext.controllerName}.${servletContext.actionName}`)
  }
}