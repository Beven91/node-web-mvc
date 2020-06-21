/**
 * @module ParameterRequiredError
 * @description 一个错误类型，用于表示当前参数没有传递
 */

import MethodParameter from "../interface/MethodParameter";
import ServletContext from "../servlets/http/ServletContext";

export default class ParameterRequiredError extends Error {
  constructor(parameter: MethodParameter, servletContext: ServletContext) {
    super(`Required request parameter is missing:${parameter.value} @${servletContext.controllerName}.${servletContext.actionName}`)
  }
}