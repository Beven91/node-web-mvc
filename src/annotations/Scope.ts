import ControllerManagement from '../ControllerManagement';

/**
 * 标注指定控制器的作用域
 * 可选值为: 
 *    singleton (单例： 整个程序一个Controller仅有一个实例)
 *    prototype (多例： 每次都会创建一个新的Controller)
 */
export default function scopeAnnotation(scope) {
  return function (Controller) {
    const attributes = ControllerManagement.getControllerAttributes(Controller);
    attributes.scope = scope;
  }
}