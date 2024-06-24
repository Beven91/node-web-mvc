import Javascript from "../../interface/Javascript";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class Min extends Constraints {

  /**
   * 设定能赋值的
   *  数值: 最小值( value >= minValue)
   *  字符串: 最小长度
   *  数组: 最小长度
   */
  value: number

  validate(content: number | [] | string, valueType: Function) {
    const maxValue = this.value;
    const typer = Javascript.createTyper(valueType);
    const value = typer.isType(Number) ? content as number : (content as string).length;
    return value <= maxValue;
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Min);