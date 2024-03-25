/**
 * @module ApiOperation
 * 用于标注接口参数
 */
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import { HttpMethodKeys } from '../../servlets/http/HttpMethod';

class ApiOperation {
  /**
   * 具体接口方法的描述
   */
  value?: string

  /**
   * 接口详细描述
   */
  notes?: string

  /**
   * 当前接口方法的请求类型
   * 可选值有："GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS" and "PATCH"
   */
  httpMethod?: HttpMethodKeys

  // 返回数据类型
  returnType?: any

  // 所属标签
  tags?: string[]

  /**
   * 返回http结果类型
   */
  code?: number

  consumes?: string[]
}

/**
 * 用于标注接口类下的接口方法
 */
export default Target([ElementType.TYPE, ElementType.METHOD])(ApiOperation);