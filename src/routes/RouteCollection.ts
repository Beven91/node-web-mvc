/**
 * @module RouteCollection
 * @description MVC路由集合工具
 */

import HttpServletRequest from "../servlets/http/HttpServletRequest";
import hot from "../hot";

export interface DefaultOption {
  controller: string,
  action: string,
  area?: string,
}

export interface Route {
  url: string,
  options: DefaultOption
}

export interface MatchResult {
  controller?: string,
  controllerName?: any,
  action?: string,
  actionName?: string,
  area?: string,
  params?: any,
}

export interface Rule {
  match: (req, base) => MatchResult
  controller: Function
}

export default class RouteCollection {

  /**
   * 注册的所有普通路由
   */
  private static routes: Array<Route> = []

  /**
   * 注册的所有路由匹配规则
   */
  static rules: Array<Rule> = []


  // 基础路径
  public static base: string = ''

  /**
   * 添加一个动态路由 
   * @param {String} exp 路由表达式 例如 {controller}/{action}
   * @param {String} defaultOptions 默认路由配置项 例如： {controller:'Home',action:'index'}
   */
  static mapRoute(exp, defaultOptions: DefaultOption) {
    if (exp === '') {
      throw new Error('exp 不能为空')
    }
    exp = exp[0] === '/' ? exp.slice(1) : exp;
    this.routes = this.routes || [];
    this.routes.push({ url: exp, options: (defaultOptions || {}) as DefaultOption });
  }

  /**
   * 添加路由映射
   * @param {Rule} rule 路由映射规则
   */
  static mapRule(rule) {
    if (rule) {
      this.rules = this.rules || [];
      this.rules.push(rule);
    }
  }

  /**
   * 根据路由匹配出
   */
  static match(req: HttpServletRequest): MatchResult {
    return this.rulesMatch(req) || this.basicMatch(req.path);
  }

  /**
   * 根据rules来匹配
   * @param {Request} req 当前请求对象
   */
  static rulesMatch(req: HttpServletRequest) {
    const rules = this.rules || [];
    const request = {
      method: req.method,
      path: this.base ? req.path.replace(new RegExp('^' + this.base), '') : req.path
    }
    for (let i = 0, k = rules.length; i < k; i++) {
      const rule = rules[i];
      const result = rule.match(request, this.base);
      if (result) {
        return {
          controller: result.controller,
          action: result.action,
          controllerName: result.controllerName,
          actionName: result.actionName,
          params: result.params || {}
        }
      }
    }
  }

  /**
   * 根据路由路径来匹配
   * @param {String} path 当前请求路径 
   */
  static basicMatch(path) {
    path = this.base ? path.replace(new RegExp('^' + this.base), '') : path;
    path = path[0] === '/' ? path.slice(1) : path;
    const parts = path.split('/');
    const routes = this.routes || [];
    for (let i = 0, k = routes.length; i < k; i++) {
      const matchRoute: MatchResult = {};
      const route = routes[i];
      const defaultOptions = (route.options || {}) as DefaultOption;
      const rules = route.url.split('/');
      if (rules.length < parts.length) {
        continue;
      }
      const matched = rules.filter((rule, index) => {
        if (rule.indexOf('{') > -1) {
          const name = rule.replace('{', '').replace('}', '').trim();
          matchRoute[name] = parts[index];
          return false;
        }
        return rule !== parts[index];
      }).length < 1;
      if (matched) {
        matchRoute.controllerName = matchRoute.controller || defaultOptions.controller || '';
        matchRoute.actionName = matchRoute.action || defaultOptions.action || '';
        return matchRoute;
      }
    }
    return {};
  }
}

module.exports = RouteCollection;

hot.create(module).preload((old) => {
  // 预更新时，清空当前控制器已注册路由
  const controllerClass = old.exports.default || old.exports;
  if (typeof controllerClass !== 'function') {
    return;
  }
  RouteCollection.rules = RouteCollection.rules.filter((rule) => {
    return rule.controller !== controllerClass;
  })
});