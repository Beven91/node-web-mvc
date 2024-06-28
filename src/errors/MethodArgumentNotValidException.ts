/**
 * @module MethodArgumentNotValidException
 */
import Tracer from "../servlets/annotations/annotation/Tracer";
import MethodParameter from "../servlets/method/MethodParameter";
import Exception from "./Exception";

export default class MethodArgumentNotValidException extends Exception {

  parameter: MethodParameter

  bindingResult: {
    objectName: string
    fieldName: string
    message: string
  }

  constructor(parameter: MethodParameter, message: string, paths: string) {
    super(message);
    const classPath = Tracer.getFullName(parameter.beanType, parameter.method).replace('#', '.');
    const parameterTypeName = Tracer.getFullName(parameter.parameterType);
    const segments = paths.split('.');
    this.bindingResult = {
      objectName: segments[segments.length - 2],
      fieldName: segments[segments.length - 1],
      message: message,
    };
    this.parameter = parameter;
    this.message = `Validation failed for argument [${parameter.paramIndex}] in ${classPath}(${parameterTypeName}) Field: '${paths}', message: [${message}]`;
  }
}