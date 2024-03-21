/**
 * @module Api
 * @description swagger的Api注解 用于标注controller接口类
 */
import { ApiTag, ExternalDocs } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class Api {
  /**
   * 接口类描述 默认为class名
   */
  value?: string

  /**
   * 接口描述
   */
  description?: string

  /**
   * 外部文档信息
   */
  externalDocs?: ExternalDocs

  /**
   * 接口标签 如果没有定义tags 则默认使用 value
   */
  tags?: Array<ApiTag>
}

/**
 * 用于标注接实体类
 */
export default Target(ElementType.TYPE)(Api);