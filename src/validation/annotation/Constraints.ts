import { ClazzType } from "../../interface/declare";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";

const constraintsSymbol = Symbol('constraints');

export default abstract class Constraints {

  __exclude_keys__: 'validate'

  groups?: ClazzType | ClazzType[]

  /**
   * 自定义验证失败时的提示消息
   */
  message?: string

  /**
   * 校验值
   * @param value 
   */
  abstract validate(value: any, valueType: Function): Promise<boolean> | boolean

  constructor(info: RuntimeAnnotation) {
    const ctor = info.ctor;
    if (!ctor[constraintsSymbol]) {
      ctor[constraintsSymbol] = [];
    }
    const constraints = ctor[constraintsSymbol] as RuntimeAnnotation<Constraints>[];
    constraints.push(info);
  }

  static getConstraints(clazz: ClazzType | Function, groups: ClazzType[]) {
    const empty = [] as RuntimeAnnotation<Constraints>[];
    if (!clazz) return empty;
    const constraints = (clazz[constraintsSymbol] || empty) as RuntimeAnnotation<Constraints>[];
    return constraints.filter((m) => {
      const item = m.nativeAnnotation;
      if (!item.groups) {
        return true;
      } else if (item.groups instanceof Array) {
        return !!item.groups.find((m) => groups.indexOf(m) > -1);
      }
      return groups.indexOf(item.groups) > -1;
    });
  }
}