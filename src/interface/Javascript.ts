/**
 * @module  Javascript
 * @description 处理javascript相关兼容
 */

const empty: { __proto__?: object } = {};
const protoKeys = Reflect.ownKeys(empty.__proto__).reduce((map, k) => (map[k] = true, map), {});
const symbol = Symbol('@parameters');

export default class Javascript {
  /**
   * 获取原生对象上的keys
   */
  static get protoKeys() {
    return protoKeys;
  }

  /**
   * 提取函数签名参数
   */
  static resolveParameters(handler) {
    if (typeof handler !== 'function') {
      return [];
    }
    if (!handler[symbol]) {
      const parts = handler.toString().split('(')[1] || '';
      const express = parts.split(')')[0] || '';
      handler[symbol] = express.split(',').map((s) => s.trim()).filter((s) => !!s)
    }
    return handler[symbol];
  }

  static createTyper(childType: Function) {
    return {
      type: childType,
      isExtendOf: (parentType: Function) => {
        return parentType?.prototype?.isPrototypeOf?.(childType?.prototype);
      },
      isType: (parentType: Function) => {
        return childType && parentType === childType || parentType?.prototype?.isPrototypeOf?.(childType?.prototype);
      }
    }
  }
}

export type Typer = ReturnType<typeof Javascript['createTyper']>;