

/**
 * @module ModelAttribute
 */

import Target from "./Target";
import ElementType from "./annotation/ElementType";
import MetaProperty from "./annotation/MetaProperty";

class ModelAttribute extends MetaProperty {

  value?: string

  binding? = true

}

export default Target([ElementType.PARAMETER, ElementType.METHOD, ElementType.PROPERTY])(ModelAttribute);