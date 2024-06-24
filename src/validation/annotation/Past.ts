/**
 * 被注释的元素必须是一个过去的日期
 */

import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class Past extends Constraints {

  validate(content: string) {
    const value = String(content);
    return false;
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(Past);