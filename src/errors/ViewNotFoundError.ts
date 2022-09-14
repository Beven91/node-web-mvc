/**
 * @mdoule ViewNotFoundError
 * @description 一个错误类型，用于表示找不到视图
 */

export default class ViewNotFoundError extends Error {
  constructor(viewName) {
    super(`Cannot find view : ${viewName}`)
  }
}