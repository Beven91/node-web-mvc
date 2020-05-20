const RouteCollection = require('../RouteCollection');
const ControllerManagement = require('../ControllerManagement');

/**
 * 映射指定控制器以及控制器下的函数的请求路径
 * 例如：  @RequestMapping('/user/')
 */
module.exports = function requestMappingAnnotation(options) {
  return function (target, name, descriptor) {
    if (arguments.length > 1) {
      return requestMappingAction(target, name, descriptor, options);
    } else {
      return requestMappingController(target, options);
    }
  }
}

/**
 * 附加控制器类的请求映射
 * @param {*} target  当前控制器类
 * @param {*} mapping 配置的映射
 */
function requestMappingController(target, mapping) {
  mapping = mappingNormalized(mapping);
  ControllerManagement.setControllerAttribute('mapping', options, target);
}

/**
 * 处理控制器的指定函数请求映射
 * @param {*} target 当前控制器类
 * @param {*} name 当前函数名
 * @param {*} descriptor 当前属性描述
 * @param {*} actionMapping 配置的映射
 */
function requestMappingAction(target, name, descriptor, actionMapping) {
  actionMapping = mappingNormalized(actionMapping);
  const attributes = ControllerManagement.getControllerAttributes(target) || {};
  const mapping = attributes.mapping;
  if (mapping) {
    throw new Error('Controller must set RequestMapping @' + target.name)
  }
  const paths = mapping.value;
  const actionPaths = actionMapping.value;
  ControllerManagement.setControllerAttribute(`actions.${name}`, actionMapping);
  paths.forEach((basePath) => {
    actionPaths.forEach((actionPath) => {
      const url = (basePath + '/' + actionPath).replace(/\/{2,3}/, '/').replace(/\{/g,':').replace(/\}/g,'')
      RouteCollection.mapRule(url, target, name, actionMapping.allows);
    })
  })
}

/**
 * 标准化mapping
 * @param {*} mapping 
 */
function mappingNormalized(mapping) {
  mapping.value = ensureArrayPaths(mapping.value);
  mapping.method = ensureArrayPaths(mapping.method);
  mapping.allows = {};
  mapping.method.forEach((k) => {
    mapping.allows[k.toUpperCase()] = true;
  })
  return mapping;
}

function ensureArrayPaths(value) {
  return value instanceof Array ? value : [value];
}
