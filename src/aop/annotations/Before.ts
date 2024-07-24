import ElementType from "../../servlets/annotations/annotation/ElementType";
import Target from "../../servlets/annotations/Target";
import Pointcut from "../pointcut/Pointcut";

class Before {

  value: Pointcut['matches']

}

export default Target([ElementType.METHOD])(Before);