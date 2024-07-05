import { ClazzType } from "../interface/declare";
import Target from "../servlets/annotations/Target";
import ElementType from "../servlets/annotations/annotation/ElementType";
import JsonDeserializer from "./JsonDeserializer";

const instanceSymbol = Symbol('instance');

class JsonDeserialize {

  using: typeof JsonDeserializer

  getDeserializer(): JsonDeserializer {
    if (!this.using) {
      return null;
    }
    if (!this[instanceSymbol]) {
      const CustomSerializer = this.using as ClazzType;
      this[instanceSymbol] = new CustomSerializer();
    }
    return this[instanceSymbol];
  }

}

export default Target([ElementType.PROPERTY])(JsonDeserialize);
