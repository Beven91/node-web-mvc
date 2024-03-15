/**
 * @module Component
 * @description 注册服组件型的bean到Ioc容器中
 */

import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";

class Component {

  value?: string

}

export default Target(ElementType.TYPE)(Component);