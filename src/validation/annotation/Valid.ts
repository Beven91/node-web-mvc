import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";

class Valid {

}

export default Target([ElementType.METHOD, ElementType.PARAMETER])(Valid);