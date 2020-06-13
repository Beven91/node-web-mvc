/**
 * @module InterruptModel
 * @description 表示当前结果返回为，拦截器终止
 */
import ServletModel from './ServletModel';

export default class InterruptModel extends ServletModel {
  constructor() {
    super(null);
  }
}
