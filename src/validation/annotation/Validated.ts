import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

export type ValidateGroupType = () => void;

class Validated {
  value?: ValidateGroupType | ValidateGroupType[];
}

/**
 * 标记一个属性或者方法参数为校验对象,可进行分组配置
 */
export default Target([ ElementType.TYPE, ElementType.METHOD, ElementType.PARAMETER ])(Validated);
