/**
 * @mdoule ViewNotFoundError
 * @description 一个错误类型，用于表示找不到视图
 */

import Exception from './Exception';

export default class ViewNotFoundError extends Exception {
  constructor(viewName) {
    super(`Cannot find view : ${viewName}`);
  }
}
