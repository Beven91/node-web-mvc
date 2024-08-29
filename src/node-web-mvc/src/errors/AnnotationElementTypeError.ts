/**
 * @module AnnotationElementTypeError
 * @description 注解使用范围异常
 */
import ElementType from '../servlets/annotations/annotation/ElementType';
import Exception from './Exception';

export default class AnnotationElementTypeError extends Exception {
  constructor(name: string, types: Array<string>, elementType: ElementType) {
    super(`${name} only use at ${types.join(' ')}, but use at ${ElementType[elementType]}`);
  }
}
