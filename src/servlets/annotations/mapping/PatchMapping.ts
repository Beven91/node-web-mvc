import RequestMapping from './RequestMapping';
import RequestMappingInfo, { RouteMappingOptions } from '../../mapping/RequestMappingInfo';
import Target from '../Target';

@Target
class PatchMapping extends RequestMapping.Annotation {
  constructor(meta, value: RouteMappingOptions | string) {
    super(meta, RequestMappingInfo.create(value, 'PATCH'));
  }
}

/**
 * 配置一个Patch类型的请求映射
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default Target.install<typeof PatchMapping>(PatchMapping);