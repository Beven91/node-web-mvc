/**
 * @module Repository
 * @description 注册服组件型的bean到Ioc容器中
 */

import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import Component from './Component';

class Repository extends Component {

}

export default Target(ElementType.TYPE)(Repository);
