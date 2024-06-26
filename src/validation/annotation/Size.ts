import UnexpectedTypeException from "../../errors/UnexpectedTypeException";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import { TypedArray } from "../../servlets/http/serialization/TypeConverter";
import ValidationContext from "../ValidationContext";
import Constraints from "./Constraints";

class Size extends Constraints {

  message? = '{validation.constraints.Size.message}'

  /**
   * 当前元素必须大于等于 min
   */
  min? = 0

  /**
   * 当前元素必须小于等于 max
   */
  max? = Number.MAX_VALUE

  private getSize(value: any, context: ValidationContext) {
    const typer = context.currentTyper;
    if (typeof value == 'string') {
      return value.length;
    } else if (value instanceof Array) {
      return value.length;
    } else if (value instanceof Map) {
      return value.size;
    } else if (value instanceof Set) {
      return value.size;
    } else if (typer.isType(TypedArray)) {
      return value.length;
    } else {
      throw new UnexpectedTypeException(context);
    }
  }

  validate(value: any, context: ValidationContext) {
    if (value === null || value === undefined) {
      // 如果为null或者undefined则忽略验证
      return true;
    }
    const size = this.getSize(value, context);
    return size >= this.min && size <= this.max;
  }

}

/**
 * 验证配置元素的区间范围
 * 
 * 支持的类型:
 * - `String`
 * - `Array` 
 * - `Map`
 * - `Set`
 * - `TypedArray`
 * 
 * `null` 或者 `undefined` 则忽略验证
 */
export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Size);