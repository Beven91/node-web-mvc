import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";

class Valid {

}

/**
 * 标记一个属性或者方法参数为校验对象
 */
export default Target([ElementType.METHOD,ElementType.PROPERTY, ElementType.PARAMETER])(Valid);