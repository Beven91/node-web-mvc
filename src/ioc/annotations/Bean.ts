
/**
 * @module Bean
 * @description 标注指定方法返回值用于存储到ico容器
 */

import AliasFor from '../../servlets/annotations/AliasFor';
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

class Bean {
  @AliasFor('name')
  value?: string;

  @AliasFor('value')
  name?: string;
}

export default Target(ElementType.METHOD)(Bean);
