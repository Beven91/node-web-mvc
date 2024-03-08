/**
 * @module RouteMapping
 * @description 路由映射
 */
const ensureArrayPaths = (value) => value instanceof Array ? value : [value];

export class RouteMappingOptions {
  /**
   * 当前路由路径值
   */
  value: string | Array<string>

  /**string
   * 当前路由能处理的Http请求类型
   */
  method?: Map<string, boolean>

  /**
   * 当前路由设置的返回内容类型
   */
  produces?: string

  /**
   * 当前路由能接受的内容类型
   */
  consumes?: Array<string> | string

  /**
   * 当前路由需要的请求头信息
   */
  headers?: Map<string, string>

  /**
   * 当前路由需要的请求参数
   */
  params?: Map<string, any>
}

export default class RequestMappingInfo {

  /**
   * 当前路由路径值
   */
  public value: Array<string>

  /**string
   * 当前路由能处理的Http请求类型
   */
  public readonly method: Map<string, boolean>

  /**
   * 当前路由设置的返回内容类型
   */
  public readonly produces: string

  /**
   * 当前路由能接受的内容类型
   */
  public readonly consumes: Array<string>

  /**
   * 当前路由需要的请求头信息
   */
  public readonly headers: Map<string, string>

  /**
   * 当前路由需要的请求参数
   */
  public readonly params: Map<string, any>

  /**
   * 标准化传入的信息
   */
  static create(value, method): RequestMappingInfo {
    if (value instanceof RequestMappingInfo) {
      return value;
    }
    const data = (typeof value === 'string' ? { value: value } : value || {}) as RequestMappingInfo;
    return new RequestMappingInfo(data.value, method, data.produces, data.params, data.headers, data.consumes);
  }

  /**
   * 构造一个路由映射实例
   * @param value 当前路由匹配路径，可以为 字符串或者字符串数组
   * @param {String/Array} method 可以接受的请求方式
   * @param {String} produces 允许的返回类型 'application/json'
   * @param {Array} params 当前必要的参数 [ "userId","userName"  ]
   * @param {Array} header 当前必须要带的请求头 [ 'content-type=application/json' ]
   * @param {Array} consumes 当前请求能处理的请求类型 例如: ['application/json'] ['application/octstream']
   * @param {String} 
  */
  constructor(value, method, produces, params, headers, consumes) {
    method = method || value.method;
    this.method = {} as Map<string, boolean>;
    this.value = ensureArrayPaths(value);
    this.consumes = typeof consumes === 'string' ? [consumes] : consumes;
    this.produces = produces;
    this.params = params;
    this.headers = headers;
    const methods = ensureArrayPaths(method || ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']);
    methods.forEach((k) => {
      this.method[k.toUpperCase()] = true;
    });
  }
}