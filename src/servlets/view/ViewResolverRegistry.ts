/**
 * @module ViewResolver
 * @description 用于根据viewName去获取对应的View
 */

import ViewResolver from './resolvers/ViewResolver';
import UrlBasedViewResolver from './resolvers/UrlBasedViewResolver';
import BeanNameViewResolver from './resolvers/BeanNameViewResolver';
import { BeanFactory } from '../../ioc/factory/BeanFactory';

export default class ViewResolverRegistry {

  private readonly registerResolvers: ViewResolver[]

  constructor(beanFactory: BeanFactory) {
    this.registerResolvers = [
      new UrlBasedViewResolver(),
      new BeanNameViewResolver(beanFactory),
    ];
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
  viewResolver(resolver: ViewResolver) {
    this.registerResolvers.push(resolver);
  }
}