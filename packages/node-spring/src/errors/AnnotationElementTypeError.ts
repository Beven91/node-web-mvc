/**
 * @module AnnotationElementTypeError
 * @description 注解使用范围异常
 */
import Exception from './Exception';

export default class AnnotationElementTypeError extends Exception {
  constructor(name: string, types: Array<string>) {
    super(`${name} only use at ${types.join(' ')}`);
  }
}
