import UnexpectedTypeException from "../../errors/UnexpectedTypeException";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import ValidationContext from "../ValidationContext";
import Constraints from "./Constraints";

class Pattern extends Constraints {

  message? = '{validation.constraints.Pattern.message}'

  /**
   * 正则表达式
   */
  regexp: RegExp

  isValid(value: any, context: ValidationContext) {
    if (!context.currentTyper.isType(String)) {
      throw new UnexpectedTypeException(context);
    }
    if (value === null || value === undefined) {
      return true;
    }
    return this.regexp.test(value);
  }

}

/**
 * 通过正则表达式验证配置的元素值
 * 
 * 支持类型:
 * - `String`
 * 
 * `null` 或者 `undefined` 不做验证 
 */
export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Pattern);