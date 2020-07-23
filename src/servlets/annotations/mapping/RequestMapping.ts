import RouteCollection from '../../../routes/RouteCollection';
import ControllerManagement from '../../../ControllerManagement';
import RouteMapping, { RouteMappingOptions } from '../../../routes/RouteMapping';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ElementType from '../annotation/ElementType';

@Target
class RequestMapping {

  mapping: RouteMapping

  constructor(meta: RuntimeAnnotation, value: RouteMappingOptions | string) {
    this.mapping = RouteMapping.create(value, null);
    const { target, name, descriptor } = meta;
    switch (meta.elementType) {
      case ElementType.TYPE:
        // 修饰控制器
        requestMappingController(target, this.mapping);
        break;
      case ElementType.METHOD:
        // 修饰控制器函数
        requestMappingAction(target.constructor, name, descriptor, this.mapping);
        break;
    }
  }
}

/**
 * 映射指定控制器以及控制器下的函数的请求路径
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default Target.install<typeof RequestMapping, RouteMappingOptions | string>(RequestMapping);

/**
 * 附加控制器类的请求映射
 * @param {*} target  当前控制器类
 * @param {*} mapping 配置的映射
 */
function requestMappingController(target, mapping: RouteMappingOptions) {
  const descriptor = ControllerManagement.getControllerDescriptor(target);
  descriptor.mapping = RouteMapping.create(mapping, null);
}

/**
 * 处理控制器的指定函数请求映射
 * @param {*} target 当前控制器类
 * @param {*} name 当前函数名
 * @param {*} descriptor 当前属性描述
 * @param {*} mapping 配置的映射
 */
function requestMappingAction(target, name: string, descriptor, mapping: RouteMapping) {
  const action = ControllerManagement.getActionDescriptor(target, name);
  action.value = descriptor.value;
  action.mapping = mapping;
  RouteCollection.mapRule({
    match: (req) => {
      return mapping.match(req, target, descriptor.value, name);
    },
    action: action,
    controller: target,
  });
}

