/**
 * @module ApiModelProperty
 * 用于标注实体类下的指定属性
 */
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class ApiModelProperty {
  /**
   * 属性简短描述
   */
  value: string

  /**
   * 属性的示例值
   */
  example?: string | number | Date | boolean | Object

  /**
   * 是否为必须值
   */
  required?: boolean

  /**
   * 数据类型
   */
  dataType?: string

  /**
   * 枚举
   */
  enum?: any
}

/**
 * 用于标注实体类下的指定属性
 */
export default Target(ElementType.PROPERTY)(ApiModelProperty);