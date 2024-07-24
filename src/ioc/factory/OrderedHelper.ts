import Ordered from "../../servlets/context/Ordered";
import ProxyHelper from "./ProxyHelper";

export default class OrderedHelper {

  static sort<T>(elements: T[]) {
    return elements.sort((a, b) => {
      const ins1 = ProxyHelper.getProxyOriginInstance<Ordered>(a);
      const ins2 = ProxyHelper.getProxyOriginInstance<Ordered>(b);
      const o1 = ins1.getOrder?.() || Number.MAX_SAFE_INTEGER;
      const o2 = ins2.getOrder?.() || Number.MAX_SAFE_INTEGER;
      return o2 - o1;
    })
  }
}