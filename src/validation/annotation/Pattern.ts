import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class Pattern extends Constraints {

  /**
   * 正则表达式
   */
  regexp: RegExp

  validate(value: any) {
    return this.regexp.test(value);
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Pattern);