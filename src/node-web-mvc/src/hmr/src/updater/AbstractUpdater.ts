/**
 * @module AbstractUpdater
 * @description 数据热更新抽象类
 */

export default abstract class AbstractUpdater<T, D> {
  // 旧的模块
  protected old: any;

  // 新的模块
  protected now: any;

  // 需要进行热更新替换的数据
  protected data: D;

  // 根据构造函数创建实例
  protected createInstance = (ctor, oldInstance: T) => new ctor();

  // 从模块中导出需要的类型
  protected useFn = (m) => m.exports.default || m.exports;

  // 判断指定项，是否需要热更新替换。
  protected needHotFn = (m: T, ctor) => m instanceof ctor;

  /**
   * 构造一个更新器
   */
  constructor(data, now, old) {
    this.data = data;
    this.now = now;
    this.old = old;
  }

  /**
   * 设置:是否需要热更新的比较函数
   */
  needHot(handler: (m: T, ctor) => boolean) {
    this.needHotFn = handler;
    return this;
  }

  /**
   * 设置：提取需要热更新的类型
   */
  use(handler: (m) => any) {
    this.useFn = handler;
    return this;
  }

  /**
   * 设置：创建新的的实例的函数
   */
  creator(createInstance: (ctor, o) => T) {
    this.createInstance = createInstance;
    return this;
  }

  /**
   * 执行更新
   */
  update() {
    const { now, old } = this;
    if (!now || !old || !this.data) return;
    // 预更新时，判断当前模块是否未拦截器，如果是的话，则删除，重新注册
    const ctor = this.useFn(old);
    const newCtor = this.useFn(now);
    if (typeof ctor !== 'function') return;
    // 执行子类更新
    this.internalUpdate(ctor, newCtor);
    // 清除
    this.cleanUpdate(ctor);
  }

  /**
   * 清除当前传入的数据中，热更新模块旧的实例数据。
   */
  remove() {
    const ctor = this.useFn(this.old);
    if (typeof ctor !== 'function') {
      return;
    }
    this.cleanUpdate(ctor);
  }

  // 用于子类实现具体热更新替换
  protected abstract internalUpdate(ctor, newCtor);

  /**
   * 执行清理操作
   */
  protected abstract cleanUpdate(oldCtor);
}
