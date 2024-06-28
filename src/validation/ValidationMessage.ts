import StringUtils from "../interface/StringUtils";
import Constraints from "./annotation/Constraints";

const placeholderRegexp = /(\{(\d|\w|\.)+\})/g
const cleanRegexp = /\{|\}/g;

const resources = {
  'validation.constraints.AssertFalse.message': 'must be fasle',
  'validation.constraints.AssertTrue.message': 'must be true',
  'validation.constraints.Digits.message': 'numeric value out of bounds (<{integer} digits>.<{fraction} digits> expected)',
  'validation.constraints.Max.message': 'must be less than or equal to {value}',
  'validation.constraints.Min.message': 'must be greater than or equal to {value}',
  'validation.constraints.NotNull.message': 'must not be null',
  'validation.constraints.Null.message': 'must be null',
  'validation.constraints.Past.message': 'must be a past date',
  'validation.constraints.Furture.message': 'must be a future date',
  'validation.constraints.Pattern.message': 'must match "{regexp}"',
  'validation.constraints.Size.message': 'size must be between {min} and {max}',
}

export default class ValidationMessage {

  format(constraint: Constraints) {
    if (!constraint) return '';
    const message = String(constraint.message);
    return message.replace(placeholderRegexp, function (key) {
      const name = key.replace(cleanRegexp, '');
      const value = name in constraint ? constraint[name] : StringUtils.format(resources[name], constraint);
      return StringUtils.isEmpty(value) ? '' : value;
    });
  }

}