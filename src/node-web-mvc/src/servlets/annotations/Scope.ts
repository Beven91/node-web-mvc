/**
 * 标注指定控制器的作用域
 * 可选值为:
 *    singleton (单例： 整个程序一个Controller仅有一个实例)
 *    prototype (多例： 每次都会创建一个新的Controller)
 */
import { ScopeType } from '../../ioc/factory/BeanDefinition';
import AliasFor from './AliasFor';
import Target from './Target';
import ElementType from './annotation/ElementType';

class Scope {
  // 作用域
  @AliasFor('value')
  scope: ScopeType;

  @AliasFor('scope')
  value: string;
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target(ElementType.TYPE)(Scope);
