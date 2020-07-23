import RequestMapping from './RequestMapping';
import RouteMapping, { RouteMappingOptions } from '../../../routes/RouteMapping';
import Target from '../Target';

@Target
class GetMapping extends RequestMapping.Annotation {
  constructor(meta, value: RouteMappingOptions) {
    super(meta, RouteMapping.create(value, 'GET'));
  }
}

/**
 * 配置一个GET类型请求映射
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default Target.install<typeof GetMapping, RouteMappingOptions | string>(GetMapping);