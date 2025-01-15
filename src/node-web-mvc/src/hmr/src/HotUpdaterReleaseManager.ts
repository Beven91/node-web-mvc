import cp from 'child_process';

type ReleaseHandler = () => void;
type ReleaseForHandler = (file: string) => void;
type OmitFunctionKeys<T> = { [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never }[keyof T];
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

const destroyHandlers: ReleaseHandler[] = [];
const releaseForHandlers: ReleaseForHandler[] = [];

export default class HotUpdaterReleaseManager {
  private static installed = false;

  private static normalizeId(file: string) {
    return (file || '').toLowerCase();
  }

  private static resolveDependency(stack: string) {
    const files = (stack || '').split('\n').slice(2, 10).map((m) => {
      return m.split('(').pop().replace(/(:\d+)+/, '').replace(/\)$/, '');
    });
    return files[0];
  }

  /**
   * 通用拦截函数，用于拦截指定函数的返回值，与调用依赖，记录下依赖与返回值
   * @param name 要拦截的函数名
   * @param target 要拦截的目标对象
   * @param dependencies 依赖记录集合
   * @returns 代理对象
   */
  private static proxyMethod<T extends object, K extends OmitFunctionKeys<T>>(target: T, name: K, releaseHandler: (value: GetReturnType<T[K]>) => void) {
    const scope = this;
    const dependencies = new Map<String, any[]>();
    releaseForHandlers.push((file: string) => {
      file = this.normalizeId(file);
      const values = dependencies.get(file) || [];
      values.forEach((value) => {
        // console.log('release method', name);
        releaseHandler(value);
      });
    });
    const value = target[name] as any;
    const meta = Proxy.revocable(value, {
      apply(handler: Function, thisArg, args) {
        const file = scope.resolveDependency(new Error().stack);
        const id = scope.normalizeId(file);
        const returnValue = handler.apply(thisArg, args);
        if (!dependencies.has(id)) {
          dependencies.set(id, []);
        }
        dependencies.get(id).push(returnValue);
        // console.log('call method', name);
        return returnValue;
      },
    });
    target[name] = meta.proxy;
    return meta.proxy;
  }

  /**
   * 通用拦截类构造函数，并且记录调用依赖
   * @param clazz 类
   * @param releaseHandler 自定义释放函数
   * @returns
   */
  private static proxyClass<T extends new(...args: any[]) => any>(clazz: T, releaseHandler: (value: InstanceType<T>) => void) {
    const scope = this;
    const dependencies = new Map<String, any[]>();
    releaseForHandlers.push((file: string) => {
      file = this.normalizeId(file);
      const values = dependencies.get(file) || [];
      values.forEach((value) => {
        // console.log('release instance', clazz.name);
        releaseHandler(value);
      });
    });
    const meta = Proxy.revocable(clazz, {
      construct(target, argArray) {
        const file = scope.resolveDependency(new Error().stack);
        const id = scope.normalizeId(file);
        const returnValue = new target(...argArray);
        if (!dependencies.has(id)) {
          dependencies.set(id, []);
        }
        dependencies.get(id).push(returnValue);
        // console.log('create instance', target.name);
        return returnValue;
      },
    });
    return meta.proxy;
  }

  static install() {
    if (this.installed) return;
    this.installed = true;
    // 拦截setInterval
    this.proxyMethod(global, 'setInterval', (id) => clearInterval(id));
    // 拦截setTimeout
    this.proxyMethod(global, 'setTimeout', (id) => clearTimeout(id));
    // 拦截子进程
    this.proxyMethod(cp, 'spawn', (child) => child.kill());
    this.proxyMethod(cp, 'exec', (child) => child.kill());
    this.proxyMethod(cp, 'execFile', (child) => child.kill());
    this.proxyMethod(cp, 'fork', (child) => child.kill());
  }

  static push(handler: ReleaseHandler) {
    destroyHandlers.push(handler);
  }

  static releaseFor(file: string) {
    releaseForHandlers.forEach((handler) => handler(file));
  }

  static destroy() {
    destroyHandlers.forEach(handler => handler());
    destroyHandlers.length = 0;
    Object.keys(require.cache).forEach((file) => {
      this.releaseFor(file);
    });
    destroyHandlers.length = 0;
  }
}
