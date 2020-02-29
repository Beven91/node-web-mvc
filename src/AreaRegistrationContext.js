/**
 * 名称：注册MVC域(Area)的上下文类
 * 描述：用于提供给AreaRegistraction.registerArea的context
 */

const RouteCollection = require('./routeCollection');

class AreaRegistractionContext {

  constructor(areaName) {
    this.areaName = areaName;
  }

  /**
   * 注册Area(域)路由
   * @param {String} exp 路由表达式 例如 admin/{controller}/{action}
   * @param options 路由配置项 例如： {controller:'Home',action:'index'}
   * @memberof AreaRegistractionContext
   */
  mapRoute(exp, options) {
    options = options || {};
    options.area = this.areaName;
    RouteCollection.mapRoute(exp, options);
  }
}

module.exports = AreaRegistractionContext;