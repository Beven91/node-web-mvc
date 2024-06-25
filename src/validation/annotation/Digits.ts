import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class Digits extends Constraints {

  /**
   * 整数部分最大位数
   */
  interger: number

  /**
   * 小数部分最大位数
   */
  fraction: number

  validate(value: number) {
    const [interger, fraction = ''] = String(value).split('.');
    return interger.length <= this.interger && fraction.length <= this.fraction;
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Digits);