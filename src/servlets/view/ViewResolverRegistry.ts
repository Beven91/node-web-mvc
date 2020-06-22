/**
 * @module ViewResolver
 * @description 用于根据viewName去获取对应的View
 */

import ViewResolver from './ViewResolver';

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