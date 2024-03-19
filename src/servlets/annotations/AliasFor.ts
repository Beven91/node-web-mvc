
/**
 * 一个别名注解
 * 可用于为注解的属性，进行别名赋值配置
 */
import Target from "./Target";
import ElementType from "./annotation/ElementType";

class AliasFor {
  value?: string

  /**
   * 将属性值赋值给合并注解的指定属性值
   */
  annotation?: any
}

/**
 * 一个别名注解
 * 可用于为注解的属性，进行别名赋值配置
 */
export default Target(ElementType.PROPERTY)(AliasFor);