/**
 * @module ListReplacement
 * @description 列表注册型模块热更新
 */
import ArrayUpdater from './ArrayUpdater';

export default class ListReplacement {
  constructor(elements: Array<any>, now, old) {
    const updater = new ArrayUpdater(elements, now, old);
    updater.update();
  }
}
