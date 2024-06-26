import UnexpectedTypeException from "../../errors/UnexpectedTypeException";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import ValidationContext from "../ValidationContext";
import Constraints from "./Constraints";

class Min extends Constraints {

  message? = '{validation.constraints.Min.message}'

  /**
   * 设定能赋值的最大值
   */
  value: number

  getSize(value: any, context: ValidationContext) {
    const typer = context.currentTyper;
    if (typer.isType(String)) {
      return value.length;
    } else if (typer.isType(Number)) {
      return value;
    } else {
      throw new UnexpectedTypeException(context);
    }
  }

  validate(content: any, context: ValidationContext) {
    const maxValue = this.value;
    const value = this.getSize(content, context);
    return value >= maxValue;
  }
}

/**
 * 验证标注元素的值必须大于等于配置的最小值
 * 
 * 支持的数据类型:
 * 
 * - `Number`
 * - `String`
 * 
 * `null` 或者 `undefined` 则不做验证
 */
export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Min);