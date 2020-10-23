/**
 * @module ArgumentResolvError
 */

export default class ArgumentResolvError extends Error {
  constructor(message) {
    super(`Argument resolve error:\n ${message}`);
  }
}