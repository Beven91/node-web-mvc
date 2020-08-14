/**
 * @module ListReplacement
 * @description 列表注册型模块热更新
 */

export default class ListReplacement {

  constructor(elements: Array<any>, now, old) {
    if (!now || !old) return;
    // 预更新时，判断当前模块是否未拦截器，如果是的话，则删除，重新注册
    const ctor = old.exports.default || old.exports;
    const newCtor = now.exports.default || now.exports;
    if (typeof ctor !== 'function') return;
    const creatable = typeof newCtor === 'function';
    // 替换实例
    elements.forEach((element, index) => {
      if (!creatable || !(element instanceof ctor)) {
        return;
      } else if (!creatable) {
        console.warn(`Hot fail: ${newCtor.name} : No-parameter construction required`);
      }
      elements[index] = new newCtor();
    });
    // 移除掉需要热更的拦截器相关的实例
    const items = elements.filter((i) => !(i instanceof ctor));
    if (items.length !== elements.length) {
      elements.length = 0;
      elements.push(...items);
    };
  }
}