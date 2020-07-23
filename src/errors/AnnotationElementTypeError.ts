/**
 * @module AnnotationElementTypeError
 * @description 注解使用范围异常
 */

export default class AnnotationElementTypeError extends Error {
  constructor(name: string, types: Array<string>) {
    super(`${name} only use at ${types.join(' ')}`)
  }
}