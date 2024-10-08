/**
 * @module ArgumentResolvError
 */
import Exception from './Exception';

export default class ArgumentResolvError extends Exception {
  constructor(ex: Error | string, name: string) {
    if (typeof ex === 'string') {
      super(ex);
    } else {
      super(`Argumen '${name}' resolve error:\n ${ex.message}`);
      this.stack = ex.stack;
    }
  }
}
