/**
 * @module HotReload
 */
import path from 'path';
import fs from 'fs';
import HotModule from './HotModule';
import Module from 'module';

export declare class NodeHotModule extends Module {
  hot: HotModule
}

export declare class HotOptions {
  /**
   * 热更新监听目录
   */
  cwd: string
  /**
   * 热更新执行频率，单位：毫秒
   */
  reloadTimeout?: number
}

export default class HotReload {
  /**
   * 热更新配置
   */
  options: HotOptions

  /**
   * 当前所有热更新模块
   */
  private hotModules: Map<string, HotModule>

  /**
   * 热更新执行频率单位：毫秒
   */
  private reloadTimeout: number

  /**
   * 构造一个热更新实例
   */
  constructor(options: HotOptions) {
    this.options = options;
    this.reloadTimeout = options.reloadTimeout || 300;
    this.hotModules = new Map<string, HotModule>();
    this.hotWrap();
    // this.buildDependencies();
  }

  /**
   * 创建指定id的热更新模块，如果模块已存在，则直接返回
   * @param id 模块id 
   */
  private create(id): HotModule {
    if (!this.hotModules.get(id)) {
      this.hotModules.set(id, new HotModule(id));
    }
    return this.hotModules.get(id);
  }

  /**
   * 监听文件改动
   */
  watch(cwd) {
    const runtime = { timerId: null }
    fs.watch(cwd, { recursive: true }, (type, filename) => {
      const id = path.join(cwd, filename);
      clearTimeout(runtime.timerId);
      runtime.timerId = setTimeout(() => this.reload(id), this.reloadTimeout);
    });
  }

  /**
   * 重载模块
   */
  reload(id) {
    if (!require.cache[id]) {
      // 如果模块已删除，则直接掠过
      return;
    }
    const start = Date.now();
    console.log(`        Hot reload: ${id} ...`);
    // 获取旧的模块实例
    const old = require.cache[id] as NodeHotModule;
    const hot = old.hot;
    // 执行hooks.pre
    hot.invokeHook('pre', {}, old);
    // 执行hooks.preend
    hot.invokeHook('preend', {}, old);
    // 将hot对象从旧的模块实例上分离
    delete old.hot;
    // 删除缓存
    delete require.cache[id];
    // 重新载入模块
    require(id);
    // 获取当前更新后的模块实例
    const now = require.cache[id];
    // 执行hooks.accept
    hot.invokeHook('accept', {}, now, old);
    const end = new Date();
    console.log(`        Time: ${end.getTime() - start}ms`);
    console.log(`        Built at: ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`);
    console.log(`        Hot reload successfully`);
  }

  /**
   * 改写require,给需要热更的模块添加
   */
  hotWrap() {
    const extensions = require.extensions;
    Object.keys(extensions).forEach((ext) => {
      const handler = extensions[ext];
      extensions[ext] = (mod, id, ...others) => {
        if (!HotModule.isInclude(id)) {
          return handler(mod, id, ...others);
        }
        const anyModule = mod as any;
        const parentId = mod.parent.filename;
        const parent = this.create(parentId);
        const hot = this.create(id);
        // 附加 hot对象
        anyModule.hot = hot;
        if (module !== mod.parent) {
          hot.addReason(parent);
        }
        // 执行模块初始化
        handler(mod, id, ...others);
        // 进行热补丁
        hot.createHot(mod);
        // 返回热更新模块的exports
        return hot.hotExports;
      }
    });
  }

  /**
   * 项目启动后，初始化构建热更新模块
   */
  buildDependencies() {
    const cache = require.cache;
    Object.keys(cache).map((k) => {
      const mod = cache[k];
      const hotModule = this.create(k);
      mod.children.forEach((m) => this.create(m.filename).addReason(hotModule));
    });
  }

  /**
   * 监听改变
   */
  static run(options: HotOptions) {
    const hot = new HotReload(options);
    // 监听文件改动
    hot.watch(options.cwd);
  }
}