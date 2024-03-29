
/**
 * @module Bean
 * @description 标注指定方法返回值用于存储到ico容器
 */

import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Component from "./Component";

class Bean extends Component {

}

export default Target(ElementType.METHOD)(Bean);