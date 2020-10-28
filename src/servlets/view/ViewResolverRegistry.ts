/**
 * @module ViewResolver
 * @description 用于根据viewName去获取对应的View
 */

import hot from 'nodejs-hmr';
import ViewResolver from './resolvers/ViewResolver';

export default class ViewResolverRegistry {

  private readonly registerResolvers: Array<ViewResolver>;

  constructor() {
    this.registerResolvers = new Array<ViewResolver>();
    hotAccepted(this.registerResolvers);
  }

  /**
   * 当前注册所有视图解析器
   */
  get viewResolvers() {
    return this.registerResolvers;
  }

  /**
   * 添加一个视图解析器
   */
  addViewResolver(resolver: ViewResolver) {
    this.registerResolvers.push(resolver);
  }
}

function hotAccepted(registerResolvers) {
  // 热更新
  hot
    .create(module)
    .clean()
    .postend((now, old) => {
      hot.createHotUpdater(registerResolvers, now, old).update();
    });
}