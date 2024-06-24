import Javascript from "../../interface/Javascript";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class Max extends Constraints {

  /**
   * 设定能赋值的最大值
   *  数值: 最大值(value <= maxValue)
   *  字符串: 最大长度
   *  数组: 最大长度
   */
  value: number

  validate(content: number | [] | string, valueType: Function) {
    const maxValue = this.value;
    const typer = Javascript.createTyper(valueType);
    const value = typer.isType(Number) ? content as number : (content as string).length;
    return value <= maxValue;
  }
}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Max);