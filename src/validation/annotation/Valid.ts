import { ClazzType } from "../../interface/declare";
import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";

const childValidations = Symbol('child_validations');

class Valid {

  public static getChildValidations(clazz: ClazzType | Function) {
    const empty = [] as RuntimeAnnotation<Valid>[];
    if (!clazz) return empty;
    return (clazz[childValidations] || empty) as RuntimeAnnotation<Valid>[];
  }

  constructor(info: RuntimeAnnotation<Valid>) {
    if (info.elementType !== ElementType.PROPERTY) {
      return;
    }
    const ctor = info.ctor;
    if (!ctor[childValidations]) {
      ctor[childValidations] = [];
    }
    const validations = ctor[childValidations] as RuntimeAnnotation<Valid>[];
    validations.push(info);
  }
}

/**
 * 标记一个属性或者方法参数为校验对象
 */
export default Target([ElementType.METHOD, ElementType.PROPERTY, ElementType.PARAMETER])(Valid);