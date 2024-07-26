/**
 * @module ApiModel
 * 用于标注接实体类
 */

import { ExternalDocs } from '../openapi/declare';
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class ApiModel {
  /**
   * model的别名，默认为类名
   */
  value?: string;

  /**
   * model的详细描述
   */
  description?: string;

  /**
   * 外部文档信息
   */
  externalDocs?: ExternalDocs;
}

/**
 * 用于标注接实体类
 */
export default Target(ElementType.TYPE)(ApiModel);
