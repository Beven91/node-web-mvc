import RouteCollection from '../../routes/RouteCollection';
import ControllerManagement, { ActionDescriptors } from '../../ControllerManagement';
import RouteMapping from '../../routes/RouteMapping';

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
export default function requestMappingAnnotation(value, method?, produces?, params?, headers?): any {
  return function (target, name, descriptor) {
    const mapping = new RouteMapping(value, method, produces, params, headers);
    if (arguments.length > 1) {
      return requestMappingAction(target.constructor, name, descriptor, mapping);
    } else {
      return requestMappingController(target, mapping);
    }
  }
}

/**
 * 附加控制器类的请求映射
 * @param {*} target  当前控制器类
 * @param {*} mapping 配置的映射
 */
function requestMappingController(target, mapping: RouteMapping) {
  const descriptor = ControllerManagement.getControllerDescriptor(target);
  descriptor.mapping = mapping;
}

/**
 * 处理控制器的指定函数请求映射
 * @param {*} target 当前控制器类
 * @param {*} name 当前函数名
 * @param {*} descriptor 当前属性描述
 * @param {*} mapping 配置的映射
 */
function requestMappingAction(target, action: string, descriptor, mapping: RouteMapping) {
  const controllerlDescriptor = ControllerManagement.getControllerDescriptor(target);
  if (!controllerlDescriptor.actions[action]) {
    controllerlDescriptor.actions[action] = {} as ActionDescriptors;
  }
  controllerlDescriptor.actions[action] = {
    value: descriptor.value,
    mapping: mapping
  };
  RouteCollection.mapRule({
    match: (req) => mapping.match(req, target, descriptor.value, action),
    action: action,
    controller: target,
  });
}

