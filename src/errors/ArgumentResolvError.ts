/**
 * @module ArgumentResolvError
 */

export default class ArgumentResolvError extends Error {
  constructor(message: string) {
    super(`Argument resolve error:\n ${message}`);
  }
}