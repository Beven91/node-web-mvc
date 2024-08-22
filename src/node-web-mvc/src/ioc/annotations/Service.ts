/**
 * @module Service
 * @description 注册服务类型的bean到Ioc容器中
 */

import Target from '../../servlets/annotations/Target';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import Component from './Component';

class Service extends Component {
}

export default Target(ElementType.TYPE)(Service);
