import { ClazzType } from "../../interface/declare";
import Method from "../../interface/Method";

export default abstract class Pointcut {

  static TRUE: Pointcut

  abstract matches(clazz: ClazzType, method: Method): boolean

}

class TruePointcut extends Pointcut {
  
  matches(clazz: ClazzType, method: Method): boolean {
    return true;
  }
}

Pointcut.TRUE = new TruePointcut();