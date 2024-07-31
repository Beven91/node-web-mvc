/**
 * @module Autowired
 * @description 自动装配注解，可用于装配类的构造函数，以及属性，方法。
 */

import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
class Autowired {
  /**
   * 是否当前装配的实例必须存在，如果无法装配，则抛出异常
   * 默认为:treu
   */
  required? = true;
}

// 公布注解
export default Target([ ElementType.PROPERTY, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE ])(Autowired);
