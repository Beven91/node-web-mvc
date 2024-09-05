/**
 * @module ListUpdater
 * @description 列表更新器
 */

import AbstractUpdater from './AbstractUpdater';

export default class ArrayUpdater<T> extends AbstractUpdater<T, Array<T>> {
  internalUpdate(ctor, newCtor) {
    const creatable = typeof newCtor === 'function';
    const elements = this.data;
    // 替换实例
    elements.forEach((element, index) => {
      if (!creatable || !this.needHotFn(element, ctor)) {
        return;
      } else if (!creatable) {
        console.warn(`Hot fail: ${newCtor.name} : No-parameter construction required`);
      }
      elements[index] = this.createInstance(newCtor, element);
    });
  }

  cleanUpdate(oldCtor) {
    const elements = this.data;
    const items = elements.filter((m) => !(this.needHotFn(m, oldCtor)));
    if (items.length !== elements.length) {
      elements.length = 0;
      elements.push(...items);
    };
  }
}
