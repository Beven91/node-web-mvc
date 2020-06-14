import RequestMapping from './RequestMapping';
import RouteMapping from '../../routes/RouteMapping';

/**
 * 配置一个GET请求映射
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default function (value: RouteMapping | string) {
  return RequestMapping(RouteMapping.create(value, 'GET'));
}