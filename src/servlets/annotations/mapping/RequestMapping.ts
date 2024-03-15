import hot from 'nodejs-hmr';
import RequestMappingInfo from '../../mapping/RequestMappingInfo';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import ElementType from '../annotation/ElementType';
import { HttpMethodKeys } from '../../http/HttpMethod';

export class BaseRequestMapping {
  /**
     * 当前路由路径值
     */
  value: string | string[]

  /**
   * 当前路由设置的返回内容类型
   */
  produces?: string

  /**
   * 当前路由能接受的内容类型
   */
  consumes?: string | string[]

  /**
   * 当前路由需要的请求头信息
   */
  headers?: Map<string, string>

  /**
   * 当前路由需要的请求参数
   */
  params?: Map<string, any>
}

export class RequestMapping extends BaseRequestMapping {
  /**string
   * 当前路由能处理的Http请求类型
   */
  method?: HttpMethodKeys | HttpMethodKeys[]

  static getMappingInfo(clazz: Function, method: string) {
    const anno = RuntimeAnnotation.getMethodAnnotation(clazz, method, RequestMapping);
    return (anno?.nativeAnnotation as RequestMappingExt)?.mapping;
  }
}

export interface RequestMappingExt {
  mapping?: RequestMappingInfo
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
export default Target([ElementType.TYPE, ElementType.METHOD])(RequestMapping);