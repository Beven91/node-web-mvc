/**
 * @module  Javascript
 * @description 处理javascript相关兼容
 */

const empty: { __proto__?: object } = {};
const protoKeys = Reflect.ownKeys(empty.__proto__).reduce((map, k) => (map[k] = true, map), {});

export default class Javascript {
  /**
   * 获取原生对象上的keys
   */
  static get protoKeys() {
    return protoKeys;
  }
}
