/**
 * @module HotReload
 */
import path from 'path';
import fs from 'fs';
import HotModule from './HotModule';
import Module from 'module';
import crypto from 'crypto';
import ListReplacement from './updater/ListReplacement';
import createHotUpdater from './updater/index';
import HotUpdaterReleaseManager from './HotUpdaterReleaseManager';

type Hooks = HotModule['hooks'];
type HookTypeKeys = keyof Hooks;

export declare class NodeHotModule extends Module {
  hot: HotModule;
}

export declare class HotOptions {
  /**
   * 热更新监听目录
   */
  cwd: string | Array<string>;
  /**
   * 热更新执行频率，单位：毫秒
   */
  reloadTimeout?: number;
  /**
   * 排除目录或者文件
   */
  exclude?: RegExp;

  /**
   * 是否解除node_modules限制
   */
  includeNodeModules?: boolean;
}

class HotReload {
  ListReplacement = ListReplacement;

  /**
   * 热更新配置
   */
  options: HotOptions;

  /**
   * 当前所有热更新模块
   */
  private hotModules: Map<string, HotModule>;

  /**
   * 热更新执行频率单位：毫秒
   */
  private reloadTimeout: number;

  private isHotUpdating = false;

  private allHash: Record<string, string>;

  constructor() {
    this.hotModules = new Map<string, HotModule>();
    this.allHash = {};
  }

  /**
   * 创建一个数据热更新器
   */
  createHotUpdater<T>(data, now, old) {
    return createHotUpdater<T>(data, now, old);
  }

  /**
   * 创建指定id的热更新模块，如果模块已存在，则直接返回
   * @param {Module} mod 模块对象
   */
  public create(mod): HotModule {
    const id = mod.filename || mod.id;
    if (!this.hotModules.get(id)) {
      mod.hot = new HotModule(id);
      this.hotModules.set(id, mod.hot);
    }
    return this.hotModules.get(id);
  }

  /**
   * 监听文件改动
   */
  watch(cwd) {
    if (!cwd) {
      return;
    }
    const runtime = {};
    return fs.watch(cwd, { recursive: true }, (type, filename) => {
      const isNodeModules = this.options.includeNodeModules !== true && /node_module/.test(filename);
      if (!isNodeModules && /\.(ts|js)$/.test(filename)) {
        const id = path.join(cwd, filename).replace(/^[A-Z]:/, (a) => a.toUpperCase());
        clearTimeout(runtime[id]);
        runtime[id] = setTimeout(() => {
          delete runtime[id];
          this.hotWatch(type, id);
        }, this.reloadTimeout);
      }
    });
  }

  hotWatch(type, filename) {
    this.isHotUpdating = true;
    const mode = type === 'rename' ? fs.existsSync(filename) ? 'created' : 'remove' : type;
    switch (mode) {
      case 'created':
        if (!require.cache[filename]) {
          console.log('Hot created:', filename);
          require(filename);
          const m = require.cache[filename] as NodeHotModule;
          // 从子依赖中删除掉刚刚引入的模块，防止出现错误的依赖关系
          const index = module.children.indexOf(m);
          index > -1 ? module.children.splice(index, 1) : undefined;
          this.invokeHook('created', m);
          this.invokeHook('postend', m, m);
          this.invokeHook('done', m, m);
        } else {
          this.handleReload(filename);
        }
        break;
      default:
        this.handleReload(filename);
    }
    this.isHotUpdating = false;
  }

  renderId(id) {
    if (process.platform === 'win32') {
      return require.cache[id] ? id : id.replace(/^[A-Z]:/, (a) => a.toLowerCase());
    }
    return id;
  }

  /**
   * 文件改动时，处理热更新
   * @param id
   */
  handleReload(file: string) {
    const id = this.renderId(file);
    // 当前逻辑不可删除，用于保证不会把没有引用的文件加载进来
    const old = require.cache[id] as NodeHotModule;
    const hash = this.allHash[id];
    const newHash = this.makeHash(file);
    if (!old || hash === newHash) {
      // 如果模块已删除，则直接掠过
      return;
    }
    if (old.hot?.hooks?.accept?.count > 0) {
      // 如果模块自定义了accept 则直接执行accept后返回
      old.hot.hooks.accept.invoke(null, old);
      return;
    }
    const start = Date.now();
    // 检索当前改动模块的所有依赖（无序的，返回的数组顺序不代表依赖顺序)
    const reasons = this.findAllReasons(old);
    // 统一清空缓存，用于解决（dependencies无序状态下也能正常按照依赖加载)
    const dependencies = reasons.map((item) => {
      const mod = require.cache[item.id] as NodeHotModule;
      // 执行hooks.pre
      this.invokeHook('pre', mod);
      // 执行hooks.preend
      this.invokeHook('preend', mod);
      delete require.cache[item.id];
      return mod;
    });
    // 加载依赖
    dependencies.filter(Boolean).forEach((dependency) => this.tryReload(dependency));
    const now = require.cache[id] as NodeHotModule;
    // 执行done
    this.invokeHook('done', now, old);
    const end = new Date();
    console.log(`Time: ${end.getTime() - start}ms`);
    console.log(`Built at: ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`);
    console.log(`Hot reload successfully`);
  }

  /**
   * 重载模块
   */
  tryReload(old: NodeHotModule) {
    const id = old.id;
    const parent = old.parent;
    try {
      // 将hot对象从旧的模块实例上分离
      delete old.hot;
      if (fs.existsSync(id)) {
        console.log(`Hot reload: ${id}`);
        HotUpdaterReleaseManager.releaseFor(id);
        // 重新加载
        require(id);
      } else {
        console.log(`Hot removed: ${id}`);
      }
      // 获取当前更新后的模块实例
      const now = (require.cache[id] || { removed: true }) as NodeHotModule;
      // 从子依赖中删除掉刚刚引入的模块，防止出现错误的依赖关系
      const index = module.children.indexOf(now);
      index > -1 ? module.children.splice(index, 1) : undefined;
      this.invokeHook('postend', now, old);
      // 还原父依赖
      if (old.parent && now) {
        now.parent = require.cache[old.parent.id];
      }
      return true;
    } catch (ex) {
      // 如果热更新异常，则需要还原被删除的内容
      const mod = require.cache[id] = (require.cache[id] || old) as NodeHotModule;
      mod.parent = parent;
      // 从子依赖中删除掉刚刚引入的模块，防止出现错误的依赖关系
      const finded = module.children.find((m) => m.filename === id);
      const index = module.children.indexOf(finded);
      index > -1 ? module.children.splice(index, 1) : undefined;
      console.error('Hot reload error', ex.stack);
      return false;
    }
  }

  /**
   * 广播注册的热更新消息
   */
  invokeHook<K extends HookTypeKeys>(name: K, ...args: Parameters<Hooks[K]['invoke']>) {
    this.hotModules.forEach((m) => {
      const hook = m.hooks[name];
      if (hook) {
        return hook.invoke.call(hook, ...args);
      }
    });
  }

  /**
   * 项目启动后，初始化构建热更新模块
   */
  findAllReasons(old: NodeHotModule) {
    const isRemoved = !fs.existsSync(old.id);
    const topReasons = [ this.create(old) ];
    if (isRemoved) {
      return topReasons;
    }
    const cache = require.cache;
    const exclude = this.options.exclude;
    const forMappings = {};
    const allMappings = {};
    const tryAcceptKeys = Object.keys(cache).filter((k) => !exclude.test(k));
    const findDependencies = (source: NodeHotModule) => {
      const reasons: HotModule[] = [];
      if (forMappings[source.id]) return [];
      forMappings[source.id] = true;
      tryAcceptKeys.forEach((key) => {
        const mod = cache[key] as NodeHotModule;
        const isAccepted = mod.hot?.hooks.accept?.count > 0;
        const isSelf = mod == old;
        if (allMappings[key] || isSelf || isAccepted) return;
        if (mod.children.indexOf(source) > -1) {
          allMappings[key] = true;
          reasons.push(this.create(mod));
          reasons.push(...findDependencies(mod));
        }
      });
      return reasons;
    };
    return topReasons.concat(findDependencies(old));
  }

  makeHash(file: string) {
    const hash = this.createHash(file);
    const id = this.renderId(file);
    this.allHash[id] = hash;
    return hash;
  }

  createHash(file: string) {
    const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 监听改变
   */
  run(options?: HotOptions) {
    options = options || {} as HotOptions;
    this.options = options;
    this.options.exclude = this.options.exclude || /node_modules/i;
    this.reloadTimeout = options.reloadTimeout || 300;
    const cwd = options.cwd || path.resolve('');
    const dirs = cwd instanceof Array ? cwd : [ cwd ];
    const watchers = dirs.map((item) => this.watch(item));
    HotUpdaterReleaseManager.install();
    const handleException = (e) => {
      if (this.isHotUpdating) {
        console.error(e);
        this.isHotUpdating = false;
        return;
      }
      throw e;
    };
    process.on('uncaughtException', handleException);
    const updater = {
      options,
      dirs,
      close() {
        process.off('uncaughtException', handleException);
        watchers.forEach((watcher) => watcher?.close?.());
      },
    };
    HotUpdaterReleaseManager.push(() => {
      this.hotModules.forEach((hot) => hot.clean());
      this.hotModules.clear();
      updater.close();
    });
    return updater;
  }
}

export default new HotReload();
