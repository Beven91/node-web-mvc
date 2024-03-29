/**
 * @module ArgumentConvertError
 */

export default class ArgumentConvertError extends Error {
  constructor(value, ctor, message?: string) {
    const type = Object.prototype.toString.call(value);
    const name = type.replace('[object ', '').replace(']', '');
    super(`Fail to convert ${name} to ${ctor.name} for input: ${value},${message || ''}`);
  }
}