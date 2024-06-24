import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class NotNull extends Constraints {

  validate(value: any) {
    return value !== null && value !== undefined;
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(NotNull);