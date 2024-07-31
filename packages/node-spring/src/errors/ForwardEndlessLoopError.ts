/**
 * @module ForwardEndlessLoopError
 * @description forward 死循环异常
 */
import Exception from './Exception';

export default class ForwardEndlessLoopError extends Exception {
  constructor(stacks: Array<string>) {
    super(`Forward has endless loop,stacks:\n${stacks.join('\n')}`);
  }
}
