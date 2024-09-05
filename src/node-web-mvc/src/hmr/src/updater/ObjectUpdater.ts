/**
 * @module ObjectUpdater
 * @description object类型数据更新器
 */

import AbstractUpdater from './AbstractUpdater';

export default class ObjectUpdater<T> extends AbstractUpdater<T, object> {
  internalUpdate(ctor, newCtor) {
    const creatable = typeof newCtor === 'function';
    const keys = Object.keys(this.data);
    // 替换实例
    keys.forEach((key) => {
      const element = this.data[key];
      if (!creatable || !this.needHotFn(element, ctor)) {
        return;
      } else if (!creatable) {
        console.warn(`Hot fail: ${newCtor.name} : No-parameter construction required`);
      }
      this.data[key] = this.createInstance(newCtor, element);
    });
  }

  cleanUpdate(oldCtor) {
    const keys = Object.keys(this.data);
    const removes = [];
    keys.forEach((key) => {
      const element = this.data[key];
      if (this.needHotFn(element, oldCtor)) {
        removes.push(key);
      }
    });
    removes.forEach((key) => {
      delete this.data[key];
    });
  }
}
