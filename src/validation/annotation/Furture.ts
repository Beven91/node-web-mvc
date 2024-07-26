import UnexpectedTypeException from '../../errors/UnexpectedTypeException';
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import ValidationContext from '../ValidationContext';
import Constraints from './Constraints';

class Furture extends Constraints {
  message? = '{validation.constraints.Furture.message}';

  isValid(content: Date, context: ValidationContext) {
    if (!context.currentTyper.isType(Date)) {
      throw new UnexpectedTypeException(context);
    }
    const now = Date.now();
    return content.getTime() > now;
  }
}

/**
 * 验证配置元素的值必须是将来的日期
 *
 * 支持的类型
 * - Date
 *
 * `null` 或者 `undefined` 不做验证
 */
export default Target([ ElementType.PROPERTY, ElementType.PARAMETER ])(Furture);
