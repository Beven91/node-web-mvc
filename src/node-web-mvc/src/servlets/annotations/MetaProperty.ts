/**
 * 原始类型属性
 */
import Target from './Target';
import ElementType from './annotation/ElementType';

class MetaProperty {
}

export default Target([ ElementType.PROPERTY, ElementType.PARAMETER, ElementType.METHOD ])(MetaProperty);
