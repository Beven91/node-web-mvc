/**
 * @module ValueConvertError
 */

import Exception from './Exception';

export default class ValueConvertError extends Exception {
  constructor(value, ctor, message?: string) {
    const type = Object.prototype.toString.call(value);
    const name = type.replace('[object ', '').replace(']', '');
    super(`Fail to convert ${name} to ${ctor.name} for input: ${value},${message || ''}`);
  }
}
