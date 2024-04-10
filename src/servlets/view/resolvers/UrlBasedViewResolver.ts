/**
 * @module UrlBasedViewResolver
 * @description 根据url来进行视图解析
 */
import ViewResolver from './ViewResolver';
import HttpServletRequest from '../../http/HttpServletRequest';
import View from '../View';
import RedirectView from '../RedirectView';
import InternalResourceView from '../InternalResourceView';

const IS_REDIRECT = /^redirect:/;
const IS_FORWARD = /^forward:/;

export default class UrlBasedViewResolver implements ViewResolver {

  /**
   * 用于拼接在视图名的前缀
   */
  private prefix: string

  /**
   * 用于追加在视频名后的后缀
   */
  private suffix: string

  /**
   * 构造一个 UrlBasedViewResolver 视图解析器
   * @param prefix 用于拼接在视图名的前缀
   * @param suffix 用于追加在视频名后的后缀 
   */
  constructor(prefix = '', suffix = '') {
    this.prefix = prefix;
    this.suffix = suffix;
  }

  /**
     * 根据传入的视图与数据来获取对应的视图
     * @param {String} viewName 视图名称
     * @param {Object} model 视图数据
     * @param {HttpServletRequest} request 当前http请求实例
     */
  resolveViewName(viewName: string, model: any, request: HttpServletRequest): View {
    if (IS_REDIRECT.test(viewName)) {
      return new RedirectView(viewName.replace(IS_REDIRECT, ''))
    } else if (IS_FORWARD.test(viewName)) {
      return new InternalResourceView(viewName.replace(IS_FORWARD, ''))
    }
    // 执行内部匹配,主要用于子类重写用
    const name = this.prefix + viewName + this.suffix;
    return this.internalResolve(name, model, request);
  }

  internalResolve(viewName: string, model: any, request: HttpServletRequest): View {
    return null;
  }
}
