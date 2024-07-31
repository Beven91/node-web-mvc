import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import Constraints from './Constraints';

class Digits extends Constraints {
  message? = '{validation.constraints.Digits.message}';

  /**
   * 整数部分最大位数
   */
  integer: number;

  /**
   * 小数部分最大位数
   */
  fraction: number;

  isValid(value: number) {
    const [ integer, fraction = '' ] = String(value).split('.');
    return integer.length <= this.integer && (fraction.length <= this.fraction || /^0+$/.test(fraction));
  }
}

/**
 * 验证配置小数数值的整数位与小数位长度
 *
 * 支持的类型
 * - `Number`
 *
 * `null` 或者 `undefined` 则不做验证
 */
export default Target([ ElementType.PROPERTY, ElementType.PARAMETER ])(Digits);
