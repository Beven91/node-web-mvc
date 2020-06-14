import RequestMapping from './RequestMapping';
import RouteMapping from '../../routes/RouteMapping';

/**
 * 配置一个DELETE请求映射
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
export default function (value: RouteMapping | string) {
  return RequestMapping(RouteMapping.create(value, 'DELETE'));
}