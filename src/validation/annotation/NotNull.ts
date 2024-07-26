import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import Constraints from './Constraints';

class NotNull extends Constraints {
  message? = '{validation.constraints.NotNull.message}';

  isValid(value: any) {
    return value !== null && value !== undefined;
  }
}

/**
 * 验证配置元素的值不能为 `null`或者`undefined`
 */
export default Target([ ElementType.PROPERTY, ElementType.PARAMETER ])(NotNull);
