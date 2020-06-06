/**
 * MVC基础Controller类,
 * 用于派生相关Controller
 * 以及提供相关基础操作函数
 */

export default class Controller {
  static controllerName;

  get isController() {
    return true;
  }
}