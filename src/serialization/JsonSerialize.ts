import { ClazzType } from '../interface/declare';
import Target from '../servlets/annotations/Target';
import ElementType from '../servlets/annotations/annotation/ElementType';
import JsonSerializer from './JsonSerializer';

const instanceSymbol = Symbol('instance');

class JsonSerialize {
  __exclude_keys__ = 'getSerializer';

  using: typeof JsonSerializer;

  getSerializer(): JsonSerializer {
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

export default Target([ ElementType.PROPERTY ])(JsonSerialize);
