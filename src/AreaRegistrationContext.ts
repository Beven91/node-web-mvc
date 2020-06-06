/**
 * 名称：注册MVC域(Area)的上下文类
 * 描述：用于提供给AreaRegistraction.registerArea的context
 */

import RouteCollection, { DefaultOption } from './routes/RouteCollection';

export default class AreaRegistractionContext {
  /**
   * 当前注册区域名
   */
  public areaName: string

  constructor(areaName: string) {
    this.areaName = areaName;
  }

  /**
   * 注册Area(域)路由
   * @param {String} exp 路由表达式 例如 admin/{controller}/{action}
   * @param options 路由配置项 例如： {controller:'Home',action:'index'}
   * @memberof AreaRegistractionContext
   */
  mapRoute(exp: string, options: DefaultOption) {
    options = options || { controller: '', action: '' };
    options.area = this.areaName;
    RouteCollection.mapRoute(exp, options);
  }
}