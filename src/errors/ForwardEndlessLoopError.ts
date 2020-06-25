/**
 * @module ForwardEndlessLoopError
 * @description forward 死循环异常
 */

export default class ForwardEndlessLoopError extends Error {
  constructor(stacks: Array<string>) {
    super(`Forward has endless loop,stacks:\n${stacks.join('\n')}`)
  }
}