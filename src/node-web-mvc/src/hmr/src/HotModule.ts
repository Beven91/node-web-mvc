/**
 * @module HotModule
 * 热更新模块
 */
import { NodeHotModule } from '.';
import Hook from './Hook';

export type HookTypes = 'accept' | 'pre' | 'preend' | 'created' | 'postend';

export type OnChangedHandler = (now: NodeHotModule, old: NodeHotModule) => void;

export default class HotModule {
  /**
   * 当前接受的accept
   */
  public hooks = {
    /**
  * 在更新后执行
  */
    accept: new Hook<OnChangedHandler>(),
    /**
     * 在执行accept前执行
     */
    pre: new Hook<(oldModule: NodeHotModule) => void>(),
    /**
     * 在执行完pre在accept之前执行
     */
    preend: new Hook<(oldModule: NodeHotModule) => void>(),
    /**
     * 再热更新完毕后
     */
    postend: new Hook<OnChangedHandler>(),

    /**
     * 新增文件后触发
     */
    created: new Hook<(current: NodeHotModule) => void>(),

    /**
     * 热更新结束
     */
    done: new Hook<OnChangedHandler>(),
  };


  public hotExports: any;

  /**
   * 模块的唯一id
   */
  public id: string;

  /**
   * 当前模块被哪些模块依赖
   */
  public reasons: Array<HotModule>;

  /**
   * 构建一个热更新模块
   * @param id 模块id
   */
  constructor(id) {
    this.id = id;
    this.reasons = [];
  }

  /**
   * 判断，是否有任意钩子监听
   */
  get hasAnyHooks() {
    const { accept, pre, preend, postend } = this.hooks;
    return accept.count > 0 || pre.count > 0 || preend.count > 0 || postend.count > 0;
  }

  /**
   * 判断当前执行，是否是从热更新触发
   */
  accept(handler: OnChangedHandler) {
    this.hooks.accept.add(handler);
    return this;
  }

  /**
   * 监听预更新，在热更新前执行
   */
  preload(handler: (old: NodeHotModule) => void) {
    this.hooks.pre.add(handler);
    return this;
  }

  /**
   * 在pre钩子执行后执行
   */
  preend(handler: (old: NodeHotModule) => void) {
    this.hooks.preend.add(handler);
    return this;
  }

  created(handler: (m: NodeHotModule) => void) {
    this.hooks.created.add(handler);
    return this;
  }

  /**
   * 清除hooks
   * @param types 要清除的hooks类型
   */
  clean(...types: Array<string>) {
    types = types.length < 1 ? Object.keys(this.hooks) : types;
    types.forEach((name) => {
      const hook = this.hooks[name] as Hook<any>;
      hook.clean();
    });
    return this;
  }

  /**
   * 热更新完毕
   * @param params
   */
  postend(handler: OnChangedHandler) {
    this.hooks.postend.add(handler);
    return this;
  }

  allDone(handler: OnChangedHandler) {
    this.hooks.done.add(handler);
    return this;
  }
}
