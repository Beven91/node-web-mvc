
/**
 * 一个别名注解
 * 可用于为注解的属性，进行别名赋值配置
 */
import Target from './Target';
import Alias from './annotation/Alias';
import ElementType from './annotation/ElementType';

class AliasFor extends Alias {
}

/**
 * 一个别名注解
 * 可用于为注解的属性，进行别名赋值配置
 */
export default Target(ElementType.PROPERTY)(AliasFor);
