import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class AssertFalse extends Constraints {

  message? = '{validation.constraints.AssertFalse.message}'

  validate(value: any) {
    if (value === undefined || value === null) {
      return true;
    }
    return value === false;
  }

}

/**
 * 验证配置元素的值必须为`false`
 * 
 * 支持类型:
 * - `Boolean`
 * 
 * `null` 或者 `undefined` 则不做验证
 */
export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(AssertFalse);