import AliasFor from '../AliasFor';
import RequestMapping from './RequestMapping';

export default class BasicMapping {
  /**
   * 当前路由路径值
   */
  @AliasFor({
    annotation: RequestMapping,
  })
  value: string | string[];

  /**
   * 当前路由设置的返回内容类型
   */
  @AliasFor({
    annotation: RequestMapping,
  })
  produces?: string;

  /**
   * 当前路由能接受的内容类型
   */
  @AliasFor({
    annotation: RequestMapping,
  })
  consumes?: string | string[];

  /**
   * 当前路由需要的请求头信息
   */
  @AliasFor({
    annotation: RequestMapping,
  })
  headers?: Map<string, string>;

  /**
   * 当前路由需要的请求参数
   */
  @AliasFor({
    annotation: RequestMapping,
  })
  params?: Map<string, any>;
}
