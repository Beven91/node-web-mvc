import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Constraints from "./Constraints";

class AssertFalse extends Constraints {

  validate(value: any) {
    return value === false;
  }

}

export default Target([ElementType.PROPERTY, ElementType.PARAMETER])(AssertFalse);