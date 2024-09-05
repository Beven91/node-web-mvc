/**
 * @module Hook
 * @description 更新钩子
 */

export default class Hook<T extends (...params: any[]) => any> {
  private handlers: T[] = [];

  get count() {
    return this.handlers.length;
  }

  add(handler: T) {
    this.handlers.push(handler);
  }

  invoke(...args: Parameters<T>) {
    this.handlers.forEach((handler) => handler(...args));
  }

  clean() {
    this.handlers.length = 0;
  }
}
