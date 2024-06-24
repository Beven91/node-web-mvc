import { ClazzType } from "../../interface/declare";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";

class Validated {

  value?: ClazzType | ClazzType[]

}

export default Target([ElementType.TYPE, ElementType.METHOD, ElementType.PARAMETER])(Validated);