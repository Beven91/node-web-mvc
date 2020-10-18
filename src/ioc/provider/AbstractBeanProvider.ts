/**
 * @module AbstractBeanProvider
 * @description 抽象bean提供者
 */
import hot from 'nodejs-hmr';
import ObjectProvider from "./ObjectProvider";

export default abstract class AbstractBeanProvider implements ObjectProvider {

  protected beanInstances: Map<Function, any>;

  constructor() {
    const instances = this.beanInstances = new Map<Function, any>();

    hot.create(module)
      .preload((old) => {
        // 预更新时，清空当前控制器已注册路由
        const removes = [];
        const beanType = old.exports.default || old.exports;
        if (typeof beanType !== 'function') {
          return;
        }
        for (let key of instances.keys()) {
          const instance = instances.get(key);
          if (instance instanceof beanType) {
            removes.push(key);
          }
        }
        // 移除旧的配置
        removes.forEach((r) => instances.delete(r));
      });
  }

  createInstance(beanType: Function, args: Array<any>) {
    const Bean = beanType as any;
    const bean = new Bean(...args);
    return bean;
  }
}