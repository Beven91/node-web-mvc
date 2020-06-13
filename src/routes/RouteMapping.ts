/**
 * @module RouteMapping
 * @description 路由映射
 */
import ControllerManagement from '../ControllerManagement';
import * as matcher from "path-to-regexp";


const ensureArrayPaths = (value) => value instanceof Array ? value : [value];

export default class RouteMapping {

  /**
   * 当前路由路径值
   */
  public value: Array<string>

  /**
   * 当前路由能处理的Http请求类型
   */
  public method: Map<string, boolean>

  /**
   * 当前路由设置的返回内容类型
   */
  public produces: string

  /**
   * 当前路由能接受的内容类型
   */
  public consumers: Array<string>

  /**
   * 当前路由需要的请求头信息
   */
  public headers: Map<string, string>

  /**
   * 当前路由需要的请求参数
   */
  public params: Map<string, any>

  /**
   * 路由匹配规则
   */
  private rules = null

  /**
   * 构造一个路由映射实例
   * @param value 当前路由匹配路径，可以为 字符串或者字符串数组
   * @param {String/Array} method 可以接受的请求方式
   * @param {String} produces 允许的返回类型 'application/json'
   * @param {Array} params 当前必要的参数 [ "userId","userName"  ]
   * @param {Array} header 当前必须要带的请求头 [ 'content-type=application/json' ]
  */
  constructor(value, method, produces, params, headers) {
    this.method = {} as Map<string, boolean>;
    this.value = ensureArrayPaths(value);
    this.produces = produces;
    this.params = params;
    this.headers = headers;
    const methods = ensureArrayPaths(method || ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
    methods.forEach((k) => {
      this.method[k.toUpperCase()] = true;
    });
  }

  /**
   * 根据当前请求来匹配当前路由
   * @param req 请求信息
   * @param target 当前控制器
   * @param action 当前控制函数
   */
  match(req, target, action, actionName) {
    if (!this.rules) {
      // 第一次构造rules,不建议反复初始化
      this.rules = this.createRules(target, this.value);
    }
    const method = (req.method || '').toUpperCase();
    const rules = this.rules;
    const result = this.matchRules(req.path, rules);
    // 如果匹配到结果，且当前方法允许
    if (result && this.method[method]) {
      return {
        controller: target,
        action: action,
        controllerName: target.name,
        actionName: actionName,
        params: result.params
      }
    }
  }

  // 创建一条路由匹配规则
  private createRules(target, actionPaths) {
    const descriptor = ControllerManagement.getControllerDescriptor(target);
    const controllerMapping = (descriptor.mapping || {}) as RouteMapping;
    const controllerPaths = controllerMapping.value || [''];
    const rules = [];
    controllerPaths.forEach((controllerPath) => {
      actionPaths.forEach((actionPath) => {
        const exp = (controllerPath + '/' + actionPath).replace(/\/{2,3}/, '/').replace(/\{/g, ':').replace(/\}/g, '')
        rules.push({
          match: matcher.match(exp),
          exp: exp
        });
      })
    });
    return rules;
  }

  private matchRules(path, rules) {
    for (let i = 0, k = rules.length; i < k; i++) {
      const result = rules[i].match(path);
      if (result) {
        return result;
      }
    }
  }
}