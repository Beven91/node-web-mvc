/**
 * @module ArgumentResolvError
 */

export default class ArgumentResolvError extends Error {
  constructor(ex: Error | string) {
    if (typeof ex === 'string') {
      super(ex);
    } else {
      super(`Argument resolve error:\n ${ex.message}`);
      this.stack = ex.stack;
    }
  }
}