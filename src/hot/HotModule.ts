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

  public readonly hotExports: any

  /**
   * 模块的唯一id
   */
  public id: string

  /**
   * 当前模块被哪些模块依赖
   */
  public reason: Array<HotModule>

  /**
   * 构建一个热更新模块
   * @param id 模块id 
   */
  constructor(id) {
    this.id = id;
    this.reason = [];
    this.hooks = {};
    this.hotExports = {};
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
    if (invokes[this.id]) {
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
          if (/ServletModel/.test(child.filename)) {
            var a = 10;
          }
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
    if (this.reason.indexOf(hotModule) < 0) {
      this.reason.push(hotModule);
    }
  }

  /**
   * 尝试初始化一个hotExports
   * 该exports用于取代node模块默认的exports，主要用于进行细粒度的引用热更
   * @param {Module} mod 当前node模块实例
   */
  createHot(mod) {
    const exports = mod.exports;
    if (!this.nativeKeys) {
      // 如果当前模块时第一次加载，则进行初始化
      this.nativeKeys = Object.keys(exports);
      this.nativeKeys.forEach((k) => this.createHotProperty(k));
    } else {
      // 如果是第二次，则表示为热更新
      this.hotReload(exports);
    }
  }

  /**
   * 模块热更新
   * @param exports 
   */
  hotReload(exports) {
    const oldKeys = this.nativeKeys;
    const nativeKeys = Object.keys(exports);
    oldKeys.forEach((key) => {
      if (!(key in exports)) {
        // 删除掉不存在的key
        delete this.hotExports[key];
      }
    });
    // 附加新的keys
    nativeKeys.forEach((k) => {
      if (oldKeys.indexOf(k) < 0) {
        this.createHotProperty(k);
      }
    });
    // 设置新的nativeKeys
    this.nativeKeys = nativeKeys;
  }

  /**
   * 创建一个热更新属性
   */
  createHotProperty(key) {
    const cache = require.cache;
    Object.defineProperty(this.hotExports, key, {
      get: () => this.nativeExports[key],
      set: (value) => {
        this.nativeExports[key] = value;
      }
    })
  }
}