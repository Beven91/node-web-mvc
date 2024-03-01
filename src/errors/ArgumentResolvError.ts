/**
 * @module ArgumentResolvError
 */

export default class ArgumentResolvError extends Error {
  constructor(ex: Error | string, name: string) {
    if (typeof ex === 'string') {
      super(ex);
    } else {
      super(`Argumen '${name}' resolve error:\n ${ex.message}`);
      this.stack = ex.stack;
    }
  }
}