/**
 * @module ArgumentConvertError
 */

import ValueConvertError from "./ValueConvertError";

export default class ArgumentConvertError extends Error {
  constructor(name: string, error: ValueConvertError) {
    super(`Parameters: [${name}] value error \n${error.message}`);
  }
}