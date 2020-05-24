/**
 * MVC 路由集合类
 * 基于express路由
 */
class RouteCollection {

  /**
   * 添加一个动态路由 
   * @param {String} exp 路由表达式 例如 {controller}/{action}
   * @param {String} defaultOptions 默认路由配置项 例如： {controller:'Home',action:'index'}
   */
  static mapRoute(exp, defaultOptions) {
    if (exp === '') {
      throw new Error('exp 不能为空')
    }
    exp = exp[0] === '/' ? exp.slice(1) : exp;
    this.routes = this.routes || [];
    this.routes.push({ url: exp, options: defaultOptions || {} });
  }

  /**
   * 添加路由映射
   * @param {String} exp 路由表达式 例如 user/find
   * @param {String} controller 控制器名称
   * @param {String} action 函数名
   * @param {Object} allowMethods 
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
  static match(req) {
    return this.ruleMatch(req) || this.basicMatch(req.path);
  }

  /**
   * rule match
   */
  static ruleMatch(req) {
    const rules = this.rules || [];
    for (let i = 0, k = rules.length; i < k; i++) {
      const rule = rules[i];
      const result = rule.match(req);
      if (result) {
        return {
          controllerClass: result.controller,
          action: result.action,
          params: result.params || {}
        }
      }
    }
  }

  /**
   * basic match
   * @param {*} path 
   */
  static basicMatch(path) {
    path = path[0] === '/' ? path.slice(1) : path;
    const parts = path.split('/');
    const routes = this.routes || [];
    for (let i = 0, k = routes.length; i < k; i++) {
      const matchRoute = {};
      const route = routes[i];
      const defaultOptions = route.options || {};
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
        matchRoute.controller = matchRoute.controller || defaultOptions.controller || '';
        matchRoute.action = matchRoute.action || defaultOptions.action || '';
        return matchRoute;
      }
    }
    return {};
  }
}

/**
 * 根据传入参数，返回mvc的controller.action处理中间件 
 * @param {String} exp 匹配规则 
 * @param {Array} middlewares 前置的中间件
 * @param {String} controller controller名称
 * @param {String} action action名称  
 * @param {String} area area名称
 * @returns {Array<Function>} middlewares
 */
function bindActionMiddlewares(exp, middlewares, controller, action, area) {
  if (typeof middlewares === 'string') {
    area = action;
    action = controller;
    controller = middlewares;
    middlewares = [];
  }
  middlewares = middlewares || [];
  middlewares.push(onAction({ controller, action, area }))
  return middlewares;
}

/**
 * 返回一个生成BmvcContext的中间件函数
 * @param {Object} options 路由配置项
 * @returns {Function} (req,resp,next)=>{ ........}
 * @memberof RouteCollection
 */
function onAction(options, route) {
  return (req, resp, next) => {
    const params = req.params || {};
    req.BmvcContext = {
      areaName: params._area || options.area || '',
      controllerName: params._controller || options.controller,
      actionName: params._action || options.action
    }
    bindAreaRender(resp, req.BmvcContext);
    next('router');
  }
}

/**
 * 绑定resp.render渲染域(Area)视图支持
 */
function bindAreaRender(resp, context) {
  var originalRender = resp.render;
  resp.render = function (view) {
    const areaName = context.areaName;
    arguments[0] = areaName ? areaName + '/' + view : view;
    return originalRender.apply(this, arguments);
  }
}

module.exports = RouteCollection;