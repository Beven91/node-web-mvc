/**
 * @module MapUpdater
 * @description Map类型数据更新器
 */

import AbstractUpdater from './AbstractUpdater';

export default class MapUpdater<T> extends AbstractUpdater<T, Map<any, T>> {
  internalUpdate(ctor, newCtor) {
    const creatable = typeof newCtor === 'function';
    const elements = this.data;
    // 替换实例
    elements.forEach((element, key) => {
      if (!creatable || !this.needHotFn(element, ctor)) {
        return;
      } else if (!creatable) {
        console.warn(`Hot fail: ${newCtor.name} : No-parameter construction required`);
      }
      elements.set(key, this.createInstance(newCtor, element));
    });
  }

  cleanUpdate(oldCtor) {
    const elements = this.data;
    const removes = [];
    elements.forEach((element, key) => {
      if (this.needHotFn(element, oldCtor)) {
        removes.push(key);
      }
    });
    removes.forEach((key) => {
      elements.delete(key);
    });
  }
}
