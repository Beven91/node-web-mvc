/**
 * @module MethodArgumentNotValidException
 */
import MethodParameter from "../servlets/method/MethodParameter";
import Constraints from "../validation/annotation/Constraints";
import Exception from "./Exception";

export default class MethodArgumentNotValidException extends Exception {

  parameter: MethodParameter

  constraints: Constraints

  constructor(parameter: MethodParameter, constraints: Constraints) {
    super(constraints?.message);
    this.constraints = constraints;
    this.parameter = parameter;
  }
}