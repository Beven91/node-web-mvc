const RouteCollection = require('../RouteCollection');
const ControllerManagement = require('../ControllerManagement');
const matcher = require("path-to-regexp");

/**
 * 映射指定控制器以及控制器下的函数的请求路径
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 * @param {String/Array} method 可以接受的请求方式
 * @param {String} produces 允许的返回类型 'application/json'
 * @param {Array} params 当前必要的参数 [ "userId","userName"  ]
 * @param {Array} header 当前必须要带的请求头 [ 'content-type=application/json' ]
 */
module.exports = function requestMappingAnnotation(value, method, produces, params, headers) {
  return function (target, name, descriptor) {
    options = createMapping(value, method, produces, params, headers);
    if (arguments.length > 1) {
      return requestMappingAction(target.constructor, name, descriptor, options);
    } else {
      return requestMappingController(target, options);
    }
  }
}

/**
 * 创建一个mapping
 * @param {*} value 当前配置的path值 
 * @param {*} method 当前允许的请求方式: GET POST 
 * @param {*} params 当前必要的参数
 * @param {*} headers 当前必须要带的请求头
 */
function createMapping(value, method, produces, params, headers) {
  if (arguments.length === 1) {
    return (typeof value === 'string' || value instanceof Array) ? { value: value } : value;
  } else {
    return {
      value: value,
      method: method,
      params: params,
      produces: produces,
      headers: headers
    }
  }
}

/**
 * 附加控制器类的请求映射
 * @param {*} target  当前控制器类
 * @param {*} mapping 配置的映射
 */
function requestMappingController(target, mapping) {
  const attributes = ControllerManagement.getControllerAttributes(target);
  attributes.mapping = normalizedMapping(mapping);
}

/**
 * 处理控制器的指定函数请求映射
 * @param {*} target 当前控制器类
 * @param {*} name 当前函数名
 * @param {*} descriptor 当前属性描述
 * @param {*} actionMapping 配置的映射
 */
function requestMappingAction(target, action, descriptor, mapping) {
  const actionMapping = normalizedMapping(mapping);
  const attributes = ControllerManagement.getControllerAttributes(target);
  if (!attributes.actions) {
    attributes.actions = {};
  }
  attributes.actions[action] = actionMapping;
  RouteCollection.mapRule({
    match: (req) => matchRoute(req, target, descriptor.value, actionMapping),
  });
}

/**
 * 标准化mapping
 * @param {*} mapping 
 */
function normalizedMapping(mapping) {
  mapping.value = ensureArrayPaths(mapping.value);
  mapping.method = ensureArrayPaths(mapping.method || ['GET', 'POST', 'PUT', 'DELETE']);
  mapping.allows = {};
  mapping.method.forEach((k) => {
    mapping.allows[k.toUpperCase()] = true;
  })
  return mapping;
}

function matchRoute(req, target, action, actionMapping) {
  if (!actionMapping.rules) {
    // 第一次构造rules,不建议反复初始化
    actionMapping.rules = createRules(target, actionMapping.value);
  }
  const method = (req.method || '').toUpperCase();
  const rules = actionMapping.rules;
  const result = matchRules(req.path, rules);
  // 如果匹配到结果，且当前方法允许
  if (result && actionMapping.allows[method]) {
    return {
      controller: target,
      action: action,
      params: result.params
    }
  }
}

// 创建一条路由匹配规则
function createRules(target, actionPaths) {
  const controllerMapping = ControllerManagement.getControllerAttributes(target);
  const controllerPaths = controllerMapping.value || [''];
  const rules = [];
  controllerPaths.forEach((controllerPath) => {
    actionPaths.forEach((actionPath) => {
      const exp = (controllerPath + '/' + actionPath).replace(/\/{2,3}/, '/').replace(/\{/g, ':').replace(/\}/g, '')
      rules.push({
        match: matcher.match(exp)
      });
    })
  });
  return rules;
}

function matchRules(path, rules) {
  for (let i = 0, k = rules.length; i < k; i++) {
    const result = rules[i].match(path);
    if (result) {
      return result;
    }
  }
}

function ensureArrayPaths(value) {
  return value instanceof Array ? value : [value];
}
