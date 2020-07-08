/**
 * @module HotModule
 * 热更新模块
 */

declare class Hooks {
  /**
   * 在更新后执行
   */
  accept?: Function
  /**
   * 在执行accept前执行
   */
  pre?: Function
  /**
   * 在执行完pre在accept之前执行
   */
  preend?: Function
}

export default class HotModule {

  /**
   * 当前接受的accept
   */
  public hooks: Hooks

  /**
   * 原始监听的属性列表
   */
  private nativeKeys: Array<string>

  /**
   * 原始模块的exports对象
   */
  private get nativeExports() {
    return require.cache[this.id].exports;
  }

  public hotExports: any

  /**
   * 模块的唯一id
   */
  public id: string

  /**
   * 当前模块被哪些模块依赖
   */
  public reasons: Array<HotModule>

  /**
   * 构建一个热更新模块
   * @param id 模块id 
   */
  constructor(id) {
    this.id = id;
    this.reasons = [];
    this.hooks = {};
  }

  static isInclude(filename) {
    return !/node_modules/.test(filename);
  }

  /**
   * 判断当前执行，是否是从热更新触发
   */
  accept(handler: (now, old) => void) {
    this.hooks.accept = handler;
  }

  /**
   * 监听预更新，在热更新前执行
   */
  preload(handler: (old) => void) {
    this.hooks.pre = handler;
  }

  /**
   * 在pre钩子执行后执行
   */
  preend(handler: (old) => void) {
    this.hooks.preend = handler;
  }

  /**
   * 执行钩子
   */
  invokeHook(name, invokes, ...params) {
    if (invokes[this.id] || !require.cache[this.id]) {
      // 用于防止死循环
      return;
    } else if (this.hooks[name]) {
      this.hooks[name](...params);
    }
    // 标记成已执行
    invokes[this.id] = true;
    // 执行依赖热更
    try {
      const mod = require.cache[this.id];
      const children = mod.children;
      children.forEach((child: any) => {
        if (HotModule.isInclude(child.filename)) {
          child.hot = child.hot || new HotModule(child.filename);
        }
        if (child.hot) {
          child.hot.invokeHook(name, invokes, ...params);
        }
      });
    } catch (ex) {
      console.error(ex.stack);
    }
  }

  /**
   * 添加依赖源，标识当前模块被哪些模块依赖
   */
  addReason(hotModule: HotModule) {
    if (this.reasons.indexOf(hotModule) < 0) {
      this.reasons.push(hotModule);
    }
  }
}