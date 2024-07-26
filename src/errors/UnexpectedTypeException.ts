/**
 * @module UnexpectedTypeException
 */
import Tracer from '../servlets/annotations/annotation/Tracer';
import ValidationContext from '../validation/ValidationContext';
import Exception from './Exception';

export default class UnexpectedTypeException extends Exception {
  constructor(context: ValidationContext) {
    const { current, currentField, currentTyper } = context;
    const name = Tracer.getFullName(current.ctor, currentField);
    const constraintName = Tracer.getFullName(current.nativeAnnotation.constructor);
    super(`No validator could be found for constraint '${constraintName}' validating type '${currentTyper?.type?.name}'. Check configuration for '${name}'`);
  }
}
