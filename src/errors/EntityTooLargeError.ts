/**
 * @module EntityTooLargeError
 * @description 一个错误类型，用于表示当前请求实体过大
 */

export default class EntityTooLargeError extends Error {
  constructor() {
    super(`Entity too large`)
  }
}