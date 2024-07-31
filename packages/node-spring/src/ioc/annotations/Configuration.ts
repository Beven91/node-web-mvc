
/**
 * @module Configuration
 * @description 标注一个类为配置类
 */

import Component from './Component';
import Merge from '../../servlets/annotations/Merge';
import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';

@Merge(
  Component
)
class Configuration {

}

/**
 * 标注一个类为配置类
 */
export default Target(ElementType.TYPE)(Configuration);
