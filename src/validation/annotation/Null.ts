import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import Constraints from './Constraints';

class Null extends Constraints {
  message? = '{validation.constraints.Null.message}';

  isValid(value: any) {
    return value === null || value === undefined;
  }
}

/**
 * 验证配置元素的值必须为 `null`或者`undefined`
 */
export default Target([ ElementType.PROPERTY, ElementType.PARAMETER ])(Null);
