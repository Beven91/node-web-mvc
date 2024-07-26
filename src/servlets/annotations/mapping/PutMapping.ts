import RequestMapping from './RequestMapping';
import Target from '../Target';
import ElementType from '../annotation/ElementType';
import HttpMethod from '../../http/HttpMethod';
import Merge from '../Merge';
import BasicMapping from './BasicMapping';

@Merge(
  RequestMapping({ method: HttpMethod.PUT, value: '' })
)
class PutMapping extends BasicMapping {

}

/**
 * 配置一个PUT请求映射
 * 例如：
 *
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default Target([ ElementType.METHOD ])(PutMapping);
