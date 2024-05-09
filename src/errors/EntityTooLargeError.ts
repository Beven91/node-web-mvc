/**
 * @module EntityTooLargeError
 * @description 一个错误类型，用于表示当前请求实体过大
 */
import Exception from "./Exception";

export default class EntityTooLargeError extends Exception {
  constructor(name: string, current: number, max: number | string) {
    super(`Entity too large ${current} > max(${max})`)
  }
}