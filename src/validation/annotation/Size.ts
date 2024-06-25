import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class Size extends Constraints {

  /**
   * 当前元素必须大于等于 min
   */
  min = 0

  /**
   * 当前元素必须小于等于 max
   */
  max = Number.MAX_VALUE

  validate(value: any) {
    return value === null || value === undefined;
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Size);