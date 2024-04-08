/**
 * 注册指定class为过滤器
 */
import Target from "../annotations/Target";
import ElementType from "../annotations/annotation/ElementType";

export class WebFilter {

  /**
   * 过滤器匹配路径规则
   */
  urlPatterns: string | string[]
}

export default Target([ElementType.TYPE])(WebFilter);