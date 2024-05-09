/**
 * @module ArgumentConvertError
 */

import Exception from "./Exception";
import ValueConvertError from "./ValueConvertError";

export default class ArgumentConvertError extends Exception {
  constructor(name: string, error: ValueConvertError) {
    super(`Parameters: [${name}] value error \n${error.message}`);
  }
}