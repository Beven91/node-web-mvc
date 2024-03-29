
/**
 * @module Qualifier
 * @description 
 */

import Target from "../../servlets/annotations/Target";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import Component from "./Component";

class Qualifier extends Component {

  value?: string

}

export default Target(ElementType.TYPE)(Qualifier);