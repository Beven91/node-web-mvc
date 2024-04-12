import Ordered from "../../servlets/context/Ordered";


export default class OrderedHelper {

  static sort<T>(elements: T[]) {
    return elements.sort((a, b) => {
      const o1 = (a as Ordered).getOrder?.() || Number.MAX_SAFE_INTEGER;
      const o2 = (b as Ordered).getOrder?.() || Number.MAX_SAFE_INTEGER;
      return o2 - o1;
    })
  }
}