import RequestMapping from './RequestMapping';
import RouteMapping, { RouteMappingOptions } from '../../../routes/RouteMapping';
import Target from '../Target';

@Target
class DeleteMapping extends RequestMapping.Annotation {
  constructor(value: RouteMappingOptions, meta) {
    super(meta, RouteMapping.create(value, 'DELETE'));
  }
}

/**
 * 配置一个DELETE类型的请求映射
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default Target.install<typeof DeleteMapping, RouteMappingOptions>(DeleteMapping);