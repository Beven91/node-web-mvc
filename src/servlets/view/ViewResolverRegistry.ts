/**
 * @module ViewResolver
 * @description 用于根据viewName去获取对应的View
 */

import hot from 'nodejs-hmr';
import ViewResolver from './resolvers/ViewResolver';

const registerResolvers: Array<ViewResolver> = [];

export default class ViewResolverRegistry {

  /**
   * 当前注册所有视图解析器
   */
  static get viewResolvers() {
    return registerResolvers;
  }

  /**
   * 添加一个视图解析器
   */
  static addViewResolver(resolver: ViewResolver) {
    registerResolvers.push(resolver);
  }
}

/**
 * 内部热更新 
 */
hot.create(module)
  .postend((now, old) => {
    hot.createHotUpdater(registerResolvers, now, old).update();
  });
